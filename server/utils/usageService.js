import User from "../models/User.js";

export const USAGE_LIMITS = {
  analysis: 5,
  coverLetter: 3,
};

export const USAGE_FIELDS = {
  analysis: "analysesUsed",
  coverLetter: "coverLettersUsed",
};

const TRACKED_USAGE_FIELDS = Object.values(USAGE_FIELDS);

function buildShouldResetExpr(now) {
  const lastResetValue = { $ifNull: ["$lastReset", now] };

  return {
    $or: [
      { $eq: ["$lastReset", null] },
      { $ne: [{ $year: lastResetValue }, now.getUTCFullYear()] },
      { $ne: [{ $month: lastResetValue }, now.getUTCMonth() + 1] },
    ],
  };
}

export function buildCurrentUsageExpr(now, fieldName) {
  return {
    $cond: [
      buildShouldResetExpr(now),
      0,
      { $ifNull: [`$${fieldName}`, 0] },
    ],
  };
}

function buildUsageProjection(now, reservedFieldName = null) {
  const usageSet = {};

  for (const fieldName of TRACKED_USAGE_FIELDS) {
    usageSet[fieldName] =
      fieldName === reservedFieldName
        ? { $add: [buildCurrentUsageExpr(now, fieldName), 1] }
        : buildCurrentUsageExpr(now, fieldName);
  }

  return usageSet;
}

export function buildUsagePayload(user, fieldName, limit) {
  const plan = user?.plan === "pro" ? "pro" : "free";
  const used = Number.isFinite(user?.[fieldName]) ? user[fieldName] : 0;
  const isFreePlan = plan === "free";

  return {
    plan,
    limit: isFreePlan ? limit : null,
    used,
    remaining: isFreePlan ? Math.max(limit - used, 0) : null,
    blocked: isFreePlan ? used >= limit : false,
  };
}

export async function syncUsage(userId) {
  const now = new Date();

  return User.findByIdAndUpdate(
    userId,
    [
      {
        $set: {
          plan: { $ifNull: ["$plan", "free"] },
          ...buildUsageProjection(now),
          lastReset: {
            $cond: [
              buildShouldResetExpr(now),
              now,
              { $ifNull: ["$lastReset", now] },
            ],
          },
        },
      },
    ],
    {
      returnDocument: "after",
      runValidators: true,
      updatePipeline: true,
    },
  ).select("plan analysesUsed coverLettersUsed lastReset");
}

export async function reserveUsage(userId, fieldName, limit) {
  const now = new Date();

  return User.findOneAndUpdate(
    {
      _id: userId,
      $expr: {
        $or: [
          { $eq: [{ $ifNull: ["$plan", "free"] }, "pro"] },
          { $lt: [buildCurrentUsageExpr(now, fieldName), limit] },
        ],
      },
    },
    [
      {
        $set: {
          plan: { $ifNull: ["$plan", "free"] },
          ...buildUsageProjection(now, fieldName),
          lastReset: {
            $cond: [
              buildShouldResetExpr(now),
              now,
              { $ifNull: ["$lastReset", now] },
            ],
          },
        },
      },
    ],
    {
      returnDocument: "after",
      runValidators: true,
      updatePipeline: true,
    },
  ).select("plan analysesUsed coverLettersUsed lastReset");
}

export async function rollbackUsage(userId, fieldName) {
  return User.findByIdAndUpdate(
    userId,
    [
      {
        $set: {
          [fieldName]: {
            $max: [{ $subtract: [{ $ifNull: [`$${fieldName}`, 0] }, 1] }, 0],
          },
        },
      },
    ],
    {
      returnDocument: "after",
      runValidators: true,
      updatePipeline: true,
    },
  ).select("plan analysesUsed coverLettersUsed lastReset");
}
