import {
  USAGE_FIELDS,
  USAGE_LIMITS,
  buildUsagePayload,
  reserveUsage,
  rollbackUsage,
  syncUsage,
} from "../utils/usageService.js";

export async function checkCoverLimit(req, res, next) {
  try {
    const user = await reserveUsage(
      req.user,
      USAGE_FIELDS.coverLetter,
      USAGE_LIMITS.coverLetter,
    );

    if (!user) {
      const syncedUser = await syncUsage(req.user);

      if (!syncedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const usage = buildUsagePayload(
        syncedUser,
        USAGE_FIELDS.coverLetter,
        USAGE_LIMITS.coverLetter,
      );

      return res.status(403).json({
        message: "Cover letter limit reached",
        upgradeRequired: true,
        ...usage,
      });
    }

    req.usageUser = user;
    req.releaseUsageReservation = async () => {
      await rollbackUsage(req.user, USAGE_FIELDS.coverLetter);
    };

    next();
  } catch (error) {
    console.error("Failed to reserve cover letter usage", error);
    res.status(500).json({ message: "Failed to validate usage limit" });
  }
}
