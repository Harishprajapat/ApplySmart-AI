import {
  buildUsagePayload,
  reserveAnalysisUsage,
  rollbackAnalysisUsage,
  syncAnalysisUsage,
} from "../utils/analysisUsage.js";

export async function checkUsageLimit(req, res, next) {
  try {
    const user = await reserveAnalysisUsage(req.user);

    if (!user) {
      const syncedUser = await syncAnalysisUsage(req.user);

      if (!syncedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const usage = buildUsagePayload(syncedUser);

      return res.status(403).json({
        code: "PLAN_LIMIT_REACHED",
        message: "Limit reached",
        upgradeRequired: true,
        ...usage,
      });
    }

    req.usageUser = user;
    req.releaseUsageReservation = async () => {
      await rollbackAnalysisUsage(req.user);
    };

    next();
  } catch (error) {
    console.error("Failed to reserve analysis usage", error);
    res.status(500).json({ message: "Failed to validate usage limit" });
  }
}
