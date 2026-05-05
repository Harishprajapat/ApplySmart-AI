import User from "../models/User.js";

export const FREE_MONTHLY_LIMIT = 5;

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

function buildCurrentUsageExpr(now) {
  return {
    $cond: [
      buildShouldResetExpr(now),
      0,
      { $ifNull: ["$analysesUsed", 0] },
    ],
  };
}

export function buildUsagePayload(user) {
  const plan = user?.plan === "pro" ? "pro" : "free";
  const used = Number.isFinite(user?.analysesUsed) ? user.analysesUsed : 0;
  const isFreePlan = plan === "free";

  return {
    plan,
    limit: isFreePlan ? FREE_MONTHLY_LIMIT : null,
    used,
    remaining: isFreePlan ? Math.max(FREE_MONTHLY_LIMIT - used, 0) : null,
    blocked: isFreePlan ? used >= FREE_MONTHLY_LIMIT : false,
  };
}

export async function syncAnalysisUsage(userId) {
  const now = new Date();

  return User.findByIdAndUpdate(
    userId,
    [
      {
        $set: {
          plan: { $ifNull: ["$plan", "free"] },
          analysesUsed: buildCurrentUsageExpr(now),
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
  ).select("plan analysesUsed lastReset");
}

export async function reserveAnalysisUsage(userId) {
  const now = new Date();

  return User.findOneAndUpdate(
    {
      _id: userId,
      $expr: {
        $or: [
          { $eq: [{ $ifNull: ["$plan", "free"] }, "pro"] },
          { $lt: [buildCurrentUsageExpr(now), FREE_MONTHLY_LIMIT] },
        ],
      },
    },
    [
      {
        $set: {
          plan: { $ifNull: ["$plan", "free"] },
          analysesUsed: { $add: [buildCurrentUsageExpr(now), 1] },
          lastReset: now,
        },
      },
    ],
    {
      returnDocument: "after",
      runValidators: true,
      updatePipeline: true,
    },
  ).select("plan analysesUsed lastReset");
}

export async function rollbackAnalysisUsage(userId) {
  return User.findByIdAndUpdate(
    userId,
    [
      {
        $set: {
          analysesUsed: {
            $max: [{ $subtract: [{ $ifNull: ["$analysesUsed", 0] }, 1] }, 0],
          },
        },
      },
    ],
    {
      returnDocument: "after",
      runValidators: true,
      updatePipeline: true,
    },
  ).select("plan analysesUsed lastReset");
}
