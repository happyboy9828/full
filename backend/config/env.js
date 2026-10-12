import dotenv from "dotenv";

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/analytics",
  dbName: process.env.DB_NAME || "analytics",
  dbRetryDelayMs: Number(process.env.DB_RETRY_DELAY_MS) || 5000,
};

export default config;
