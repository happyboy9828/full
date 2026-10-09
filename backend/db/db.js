import mongoose from "mongoose";
import config from "../config/env.js";
import logger from "../utils/logger.js";

const dbStates = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export function dbStateLabel() {
  return dbStates[mongoose.connection.readyState] || "unknown";
}

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info("mongodb_connected", {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name,
    });
  } catch (error) {
    logger.error("mongodb_connection_failed", { error: error.message });
    throw error;
  }
}

mongoose.connection.on("error", (err) => {
  logger.error("mongodb_connection_error", { error: err.message });
});

mongoose.connection.on("disconnected", () => {
  logger.warn("mongodb_disconnected");
});

mongoose.connection.on("reconnected", () => {
  logger.info("mongodb_reconnected");
});
