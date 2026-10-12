import mongoose from "mongoose";
import config from "../config/env.js";

const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];

export function dbState() {
  return dbStates[mongoose.connection.readyState] || "unknown";
}

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, { dbName: config.dbName });
    console.log(
      `MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`
    );
    return true;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

export async function connectDBWithRetry() {
  let attempt = 0;
  for (;;) {
    try {
      await connectDB();
      return;
    } catch {
      attempt += 1;
      console.log(
        `Retrying MongoDB connection in ${config.dbRetryDelayMs / 1000}s (attempt ${attempt})...`
      );
      await new Promise((resolve) => setTimeout(resolve, config.dbRetryDelayMs));
    }
  }
}

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});
