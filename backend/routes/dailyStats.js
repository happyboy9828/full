import express from "express";
import { computeDailyStats, getDailyStats } from "../controllers/dailyStatsController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAdmin);

router.post("/daily-stats/compute", computeDailyStats);
router.get("/daily-stats", getDailyStats);

export default router;