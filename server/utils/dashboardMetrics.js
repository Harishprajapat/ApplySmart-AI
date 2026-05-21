import mongoose from "mongoose";
import AIHistory from "../models/AIHistory.js";

const HISTORY_TYPES = {
  resume: "resume",
  coverLetter: "cover_letter",
};

function startOfUtcWeek(date) {
  const value = new Date(date);
  const day = value.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  value.setUTCDate(value.getUTCDate() - diff);
  value.setUTCHours(0, 0, 0, 0);
  return value;
}

function startOfUtcMonth(date) {
  const value = new Date(date);
  value.setUTCDate(1);
  value.setUTCHours(0, 0, 0, 0);
  return value;
}

function addUtcDays(date, days) {
  const value = new Date(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value;
}

function addUtcMonths(date, months) {
  const value = new Date(date);
  value.setUTCMonth(value.getUTCMonth() + months);
  return value;
}

function getFacetSingleValue(facet, key) {
  const entry = facet?.[key]?.[0];
  return entry || null;
}

function normalizeAverage(value) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.round(value);
}

function normalizeCount(value) {
  return Number.isFinite(value) ? value : 0;
}

export async function getDashboardMetrics(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const currentWeekStart = startOfUtcWeek(now);
  const previousWeekStart = addUtcDays(currentWeekStart, -7);
  const nextWeekStart = addUtcDays(currentWeekStart, 7);
  const currentMonthStart = startOfUtcMonth(now);
  const nextMonthStart = addUtcMonths(currentMonthStart, 1);

  const [summary] = await AIHistory.aggregate([
    {
      $match: {
        userId: userObjectId,
        type: { $in: [HISTORY_TYPES.resume, HISTORY_TYPES.coverLetter] },
      },
    },
    {
      $facet: {
        allActions: [{ $count: "total" }],
        currentWeek: [
          {
            $match: {
              createdAt: { $gte: currentWeekStart, $lt: nextWeekStart },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              resumeCount: {
                $sum: {
                  $cond: [{ $eq: ["$type", HISTORY_TYPES.resume] }, 1, 0],
                },
              },
              coverLetterCount: {
                $sum: {
                  $cond: [{ $eq: ["$type", HISTORY_TYPES.coverLetter] }, 1, 0],
                },
              },
            },
          },
        ],
        previousWeek: [
          {
            $match: {
              createdAt: { $gte: previousWeekStart, $lt: currentWeekStart },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              resumeCount: {
                $sum: {
                  $cond: [{ $eq: ["$type", HISTORY_TYPES.resume] }, 1, 0],
                },
              },
              coverLetterCount: {
                $sum: {
                  $cond: [{ $eq: ["$type", HISTORY_TYPES.coverLetter] }, 1, 0],
                },
              },
            },
          },
        ],
        currentMonth: [
          {
            $match: {
              createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
        resumesOverall: [
          {
            $match: { type: HISTORY_TYPES.resume },
          },
          {
            $group: {
              _id: null,
              averageScore: { $avg: "$data.atsScore" },
              resumeCount: { $sum: 1 },
              strongCount: {
                $sum: {
                  $cond: [{ $gte: ["$data.atsScore", 80] }, 1, 0],
                },
              },
            },
          },
        ],
        resumesCurrentWeek: [
          {
            $match: {
              type: HISTORY_TYPES.resume,
              createdAt: { $gte: currentWeekStart, $lt: nextWeekStart },
            },
          },
          {
            $group: {
              _id: null,
              averageScore: { $avg: "$data.atsScore" },
              resumeCount: { $sum: 1 },
              strongCount: {
                $sum: {
                  $cond: [{ $gte: ["$data.atsScore", 80] }, 1, 0],
                },
              },
            },
          },
        ],
        resumesPreviousWeek: [
          {
            $match: {
              type: HISTORY_TYPES.resume,
              createdAt: { $gte: previousWeekStart, $lt: currentWeekStart },
            },
          },
          {
            $group: {
              _id: null,
              averageScore: { $avg: "$data.atsScore" },
              resumeCount: { $sum: 1 },
              strongCount: {
                $sum: {
                  $cond: [{ $gte: ["$data.atsScore", 80] }, 1, 0],
                },
              },
            },
          },
        ],
      },
    },
  ]);

  const totalActions = normalizeCount(getFacetSingleValue(summary, "allActions")?.total);
  const currentWeekActions = normalizeCount(getFacetSingleValue(summary, "currentWeek")?.total);
  const previousWeekActions = normalizeCount(getFacetSingleValue(summary, "previousWeek")?.total);
  const currentMonthActions = normalizeCount(getFacetSingleValue(summary, "currentMonth")?.total);

  const overallResumeFacet = getFacetSingleValue(summary, "resumesOverall");
  const currentWeekResumeFacet = getFacetSingleValue(summary, "resumesCurrentWeek");
  const previousWeekResumeFacet = getFacetSingleValue(summary, "resumesPreviousWeek");

  const overallAverage = normalizeAverage(overallResumeFacet?.averageScore);
  const currentWeekAverage = normalizeAverage(currentWeekResumeFacet?.averageScore);
  const previousWeekAverage = normalizeAverage(previousWeekResumeFacet?.averageScore);

  const overallStrongResumes = normalizeCount(overallResumeFacet?.strongCount);
  const currentWeekStrongResumes = normalizeCount(currentWeekResumeFacet?.strongCount);
  const previousWeekStrongResumes = normalizeCount(previousWeekResumeFacet?.strongCount);
  const overallResumeCount = normalizeCount(overallResumeFacet?.resumeCount);

  const currentWeekCoverLetters = normalizeCount(getFacetSingleValue(summary, "currentWeek")?.coverLetterCount);
  const previousWeekCoverLetters = normalizeCount(getFacetSingleValue(summary, "previousWeek")?.coverLetterCount);
  const totalCoverLetters = Math.max(totalActions - overallResumeCount, 0);

  const interviewsBooked = Math.min(overallStrongResumes, totalCoverLetters);
  const currentWeekInterviewsBooked = Math.min(currentWeekStrongResumes, currentWeekCoverLetters);
  const previousWeekInterviewsBooked = Math.min(previousWeekStrongResumes, previousWeekCoverLetters);

  const minutesSaved = currentMonthActions * 35;
  const hoursSaved = Math.round(minutesSaved / 60);

  return {
    applications: {
      total: totalActions,
      weekly: currentWeekActions,
      previousWeekly: previousWeekActions,
      delta: currentWeekActions - previousWeekActions,
    },
    avgAtsSignal: {
      average: overallAverage,
      weeklyAverage: currentWeekAverage,
      previousWeeklyAverage: previousWeekAverage,
      delta:
        currentWeekAverage !== null && previousWeekAverage !== null
          ? currentWeekAverage - previousWeekAverage
          : null,
    },
    interviewsBooked: {
      total: interviewsBooked,
      weekly: currentWeekInterviewsBooked,
      previousWeekly: previousWeekInterviewsBooked,
      delta: currentWeekInterviewsBooked - previousWeekInterviewsBooked,
    },
    timeSaved: {
      minutesSaved,
      hoursSaved,
    },
    generatedAt: now.toISOString(),
  };
}
