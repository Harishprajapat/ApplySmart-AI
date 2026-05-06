import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { AI_HISTORY_TYPES, listAIHistory } from "../utils/aiHistoryService.js";

const router = express.Router();

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

router.get("/", protect, async (req, res) => {
  try {
    const limit = Math.min(parsePositiveInteger(req.query.limit, 50), 100);
    const skip = parsePositiveInteger(req.query.skip, 0);
    const type =
      req.query.type === AI_HISTORY_TYPES.resume || req.query.type === AI_HISTORY_TYPES.coverLetter
        ? req.query.type
        : undefined;

    const history = await listAIHistory({
      userId: req.user,
      limit,
      skip,
      type,
    });

    res.json(history);
  } catch (error) {
    console.error("Failed to fetch AI history", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

export default router;
