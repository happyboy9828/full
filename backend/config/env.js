import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local" });

const ONE_DAY = 24 * 60 * 60 * 1000;

function parseOrigins(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,

  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/analytics",
  dbName: process.env.DB_NAME || "analytics",
  dbRetryDelayMs: Number(process.env.DB_RETRY_DELAY_MS) || 5000,

  cors: {
    origin: parseOrigins(process.env.CORS_ORIGIN) || ["https://docstools-frontend.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: ONE_DAY,
  },

  adminPassword: process.env.ADMIN_PASSWORD || "kingdom",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
  adminSessionTtlMs: Number(process.env.ADMIN_SESSION_TTL_DAYS || 7) * ONE_DAY,

  trackRateLimit: Number(process.env.TRACK_RATE_LIMIT) || 100,
  trackRateWindowMs: Number(process.env.TRACK_RATE_WINDOW_MS) || 60_000,
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  authRateWindowMs: Number(process.env.AUTH_RATE_WINDOW_MS) || 15 * 60_000,

  email: {
    host: process.env.EMAIL_HOST || "",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
    from: process.env.EMAIL_FROM || "noreply@docstools.app",
    to: process.env.EMAIL_TO || "darkdevils702@gmail.com",
  },

  sms: {
    provider: process.env.SMS_PROVIDER || "mock",
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || "",
      authToken: process.env.TWILIO_AUTH_TOKEN || "",
      fromNumber: process.env.TWILIO_FROM_NUMBER || "",
    },
  },

  otp: {
    codeLength: Number(process.env.OTP_CODE_LENGTH) || 6,
    ttlMs: Number(process.env.OTP_TTL_MINUTES || 10) * 60 * 1000,
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
  },

  recoveryRateLimit: Number(process.env.RECOVERY_RATE_LIMIT) || 5,
  recoveryRateWindowMs: Number(process.env.RECOVERY_RATE_WINDOW_MS) || 15 * 60_000,
};

export default config;
