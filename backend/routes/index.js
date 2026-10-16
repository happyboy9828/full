import healthRoutes from "./health.js";
import analyticsRoutes from "./analytics.js";
import authRoutes from "./auth.js";
import reportsRoutes from "./reports.js";
import dailyStatsRoutes from "./dailyStats.js";
import feedbackRoutes from "./feedback.js";
import recoveryRoutes from "./recovery.js";

export function mountRoutes(app) {
  app.use("/", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/auth", recoveryRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/analytics/reports", reportsRoutes);
  app.use("/api/analytics/daily-stats", dailyStatsRoutes);
  app.use("/api", feedbackRoutes);
}

export { default as healthRoutes } from "./health.js";
export { default as analyticsRoutes } from "./analytics.js";
export { default as authRoutes } from "./auth.js";
export { default as reportsRoutes } from "./reports.js";
export { default as dailyStatsRoutes } from "./dailyStats.js";
export { default as feedbackRoutes } from "./feedback.js";
export { default as recoveryRoutes } from "./recovery.js";
