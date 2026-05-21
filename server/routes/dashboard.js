import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDashboardMetrics } from "../utils/dashboardMetrics.js";

const router = express.Router();

router.get("/metrics", protect, async (req, res) => {
  try {
    const metrics = await getDashboardMetrics(req.user);
    res.json(metrics);
  } catch (error) {
    console.error("Failed to fetch dashboard metrics", error);
    res.status(500).json({ message: "Failed to fetch dashboard metrics" });
  }
});

export default router;
