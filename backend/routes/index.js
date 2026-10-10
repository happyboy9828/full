import express from "express";
import healthRouter from "./health.js";
import analyticsRouter from "./analytics.js";
import reportsRouter from "./reports.js";
import authRouter from "./auth.js";
import dailyStatsRouter from "./dailyStats.js";

const router = express.Router();

router.use("/api/analytics", analyticsRouter);
router.use("/api/analytics/reports", reportsRouter);
router.use("/api/auth", authRouter);
router.use("/api/analytics", dailyStatsRouter);
router.use("/", healthRouter);

export default router;
