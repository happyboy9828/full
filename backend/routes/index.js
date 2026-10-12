import healthRoutes from "./health.js";
import analyticsRoutes from "./analytics.js";
import authRoutes from "./auth.js";
import reportsRoutes from "./reports.js";
import dailyStatsRoutes from "./dailyStats.js";

export function mountRoutes(app) {
  app.use("/", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/analytics/reports", reportsRoutes);
  app.use("/api/analytics/daily-stats", dailyStatsRoutes);
}

export { default as healthRoutes } from "./health.js";
export { default as analyticsRoutes } from "./analytics.js";
export { default as authRoutes } from "./auth.js";
export { default as reportsRoutes } from "./reports.js";
export { default as dailyStatsRoutes } from "./dailyStats.js";
