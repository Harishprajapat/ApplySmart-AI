import { buildApiUrl } from "@/lib/api";
import { fetchAIHistory, type AIHistoryItem } from "@/lib/ai-history";

export type DashboardMetrics = {
  applications: {
    total: number;
    weekly: number;
    previousWeekly: number;
    delta: number;
  };
  avgAtsSignal: {
    average: number | null;
    weeklyAverage: number | null;
    previousWeeklyAverage: number | null;
    delta: number | null;
  };
  interviewsBooked: {
    total: number;
    weekly: number;
    previousWeekly: number;
    delta: number;
  };
  timeSaved: {
    minutesSaved: number;
    hoursSaved: number;
  };
  generatedAt: string;
};

function startOfUtcWeek(date: Date) {
  const value = new Date(date);
  const day = value.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  value.setUTCDate(value.getUTCDate() - diff);
  value.setUTCHours(0, 0, 0, 0);
  return value;
}

function startOfUtcMonth(date: Date) {
  const value = new Date(date);
  value.setUTCDate(1);
  value.setUTCHours(0, 0, 0, 0);
  return value;
}

function addUtcDays(date: Date, days: number) {
  const value = new Date(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value;
}

function addUtcMonths(date: Date, months: number) {
  const value = new Date(date);
  value.setUTCMonth(value.getUTCMonth() + months);
  return value;
}

function normalizeAverage(values: number[]) {
  if (!values.length) return null;

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(average);
}

function calculateFromHistory(items: AIHistoryItem[]): DashboardMetrics {
  const now = new Date();
  const currentWeekStart = startOfUtcWeek(now);
  const previousWeekStart = addUtcDays(currentWeekStart, -7);
  const nextWeekStart = addUtcDays(currentWeekStart, 7);
  const currentMonthStart = startOfUtcMonth(now);
  const nextMonthStart = addUtcMonths(currentMonthStart, 1);

  const history = items.filter((item) => item.type === "resume" || item.type === "cover_letter");

  const currentWeekItems = history.filter((item) => {
    const createdAt = new Date(item.createdAt);
    return createdAt >= currentWeekStart && createdAt < nextWeekStart;
  });

  const previousWeekItems = history.filter((item) => {
    const createdAt = new Date(item.createdAt);
    return createdAt >= previousWeekStart && createdAt < currentWeekStart;
  });

  const currentMonthItems = history.filter((item) => {
    const createdAt = new Date(item.createdAt);
    return createdAt >= currentMonthStart && createdAt < nextMonthStart;
  });

  const resumeItems = history.filter((item) => item.type === "resume" && item.data.atsScore != null);
  const currentWeekResumeItems = currentWeekItems.filter(
    (item) => item.type === "resume" && item.data.atsScore != null,
  );
  const previousWeekResumeItems = previousWeekItems.filter(
    (item) => item.type === "resume" && item.data.atsScore != null,
  );

  const overallAtsScores = resumeItems.map((item) => item.data.atsScore as number);
  const currentWeekAtsScores = currentWeekResumeItems.map((item) => item.data.atsScore as number);
  const previousWeekAtsScores = previousWeekResumeItems.map((item) => item.data.atsScore as number);

  const overallStrongResumes = resumeItems.filter((item) => (item.data.atsScore ?? 0) >= 80).length;
  const currentWeekStrongResumes = currentWeekResumeItems.filter(
    (item) => (item.data.atsScore ?? 0) >= 80,
  ).length;
  const previousWeekStrongResumes = previousWeekResumeItems.filter(
    (item) => (item.data.atsScore ?? 0) >= 80,
  ).length;

  const coverLetters = history.filter((item) => item.type === "cover_letter").length;
  const currentWeekCoverLetters = currentWeekItems.filter((item) => item.type === "cover_letter").length;
  const previousWeekCoverLetters = previousWeekItems.filter(
    (item) => item.type === "cover_letter",
  ).length;

  const applicationsTotal = history.length;
  const applicationsWeekly = currentWeekItems.length;
  const applicationsPreviousWeekly = previousWeekItems.length;
  const minutesSaved = currentMonthItems.length * 35;
  const hoursSaved = Math.round(minutesSaved / 60);

  const interviewsTotal = Math.min(overallStrongResumes, coverLetters);
  const interviewsWeekly = Math.min(currentWeekStrongResumes, currentWeekCoverLetters);
  const interviewsPreviousWeekly = Math.min(previousWeekStrongResumes, previousWeekCoverLetters);

  const currentWeekAverage = normalizeAverage(currentWeekAtsScores);
  const previousWeekAverage = normalizeAverage(previousWeekAtsScores);

  return {
    applications: {
      total: applicationsTotal,
      weekly: applicationsWeekly,
      previousWeekly: applicationsPreviousWeekly,
      delta: applicationsWeekly - applicationsPreviousWeekly,
    },
    avgAtsSignal: {
      average: normalizeAverage(overallAtsScores),
      weeklyAverage: currentWeekAverage,
      previousWeeklyAverage: previousWeekAverage,
      delta:
        currentWeekAverage !== null && previousWeekAverage !== null
          ? currentWeekAverage - previousWeekAverage
          : null,
    },
    interviewsBooked: {
      total: interviewsTotal,
      weekly: interviewsWeekly,
      previousWeekly: interviewsPreviousWeekly,
      delta: interviewsWeekly - interviewsPreviousWeekly,
    },
    timeSaved: {
      minutesSaved,
      hoursSaved,
    },
    generatedAt: now.toISOString(),
  };
}

async function fetchAllAIHistory(token: string) {
  const items: AIHistoryItem[] = [];
  let skip = 0;
  const limit = 100;

  while (true) {
    const response = await fetchAIHistory(token, { limit, skip });
    items.push(...response.items);

    if (!response.pagination.hasMore || response.items.length === 0) {
      break;
    }

    skip += response.items.length;
  }

  return items;
}

async function fetchMetricsFromEndpoint(token: string) {
  const response = await fetch(buildApiUrl("/api/dashboard/metrics"), {
    headers: {
      Authorization: token,
    },
  });

  const data = (await response.json().catch(() => null)) as
    | Partial<DashboardMetrics & { message?: string; error?: string }>
    | null;

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || "Failed to fetch dashboard metrics";
    const error = new Error(errorMessage);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return {
    applications: {
      total: Number(data?.applications?.total) || 0,
      weekly: Number(data?.applications?.weekly) || 0,
      previousWeekly: Number(data?.applications?.previousWeekly) || 0,
      delta: Number(data?.applications?.delta) || 0,
    },
    avgAtsSignal: {
      average:
        typeof data?.avgAtsSignal?.average === "number" ? data.avgAtsSignal.average : null,
      weeklyAverage:
        typeof data?.avgAtsSignal?.weeklyAverage === "number"
          ? data.avgAtsSignal.weeklyAverage
          : null,
      previousWeeklyAverage:
        typeof data?.avgAtsSignal?.previousWeeklyAverage === "number"
          ? data.avgAtsSignal.previousWeeklyAverage
          : null,
      delta: typeof data?.avgAtsSignal?.delta === "number" ? data.avgAtsSignal.delta : null,
    },
    interviewsBooked: {
      total: Number(data?.interviewsBooked?.total) || 0,
      weekly: Number(data?.interviewsBooked?.weekly) || 0,
      previousWeekly: Number(data?.interviewsBooked?.previousWeekly) || 0,
      delta: Number(data?.interviewsBooked?.delta) || 0,
    },
    timeSaved: {
      minutesSaved: Number(data?.timeSaved?.minutesSaved) || 0,
      hoursSaved: Number(data?.timeSaved?.hoursSaved) || 0,
    },
    generatedAt: typeof data?.generatedAt === "string" ? data.generatedAt : new Date().toISOString(),
  } satisfies DashboardMetrics;
}

export async function fetchDashboardMetrics(token: string) {
  try {
    return await fetchMetricsFromEndpoint(token);
  } catch (error) {
    const status = error instanceof Error ? (error as Error & { status?: number }).status : undefined;

    if (typeof status === "number" && status < 500 && status !== 404) {
      throw error;
    }

    const history = await fetchAllAIHistory(token);
    return calculateFromHistory(history);
  }
}
