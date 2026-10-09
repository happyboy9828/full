import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

let adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) {
  if (isProduction) {
    console.error("FATAL: ADMIN_PASSWORD is required in production");
    process.exit(1);
  }
  adminPassword = "admin123";
  console.warn(
    "[config] ADMIN_PASSWORD not set - using insecure dev default 'admin123'. Set ADMIN_PASSWORD before deploying."
  );
}

const config = {
  nodeEnv: NODE_ENV,
  isProduction,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/analytics",
  adminPassword,
  adminSessionTtlDays: Number(process.env.ADMIN_SESSION_TTL_DAYS) || 7,
  cookieName: "admin_session",
  corsOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean)
    : isProduction
      ? []
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
  trustProxy: process.env.TRUST_PROXY === "true" || process.env.TRUST_PROXY === "1",
  rateLimit: {
    trackWindowMs: 60 * 1000,
    trackMax: Number(process.env.TRACK_RATE_LIMIT) || 100,
    authWindowMs: 15 * 60 * 1000,
    authMax: 20,
  },
  bodyLimit: process.env.BODY_LIMIT || "256kb",
  liveWindowMs: 5 * 60 * 1000,
  defaultReportDays: 30,
  maxReportDays: 366,
  maxReportHours: 7 * 24,
  bounceThresholdSeconds: 30,
};

export default config;
