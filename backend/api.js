"use strict";

import mongoose from "mongoose";
import { createApp } from "./app.js";
import { connectDB } from "./db/db.js";
import logger from "./utils/logger.js";

let cachedApp = null;

export default async function handler(req, res) {
  if (!cachedApp) {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    cachedApp = createApp();
    logger.info("serverless_app_initialized");
  }
  cachedApp(req, res);
}
