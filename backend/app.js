import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { dbState } from "./db/db.js";
import { mountRoutes } from "./routes/index.js";
import { requestLogger } from "./utils/logger.js";
import config from "./config/env.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowed = config.cors.origin;
        if (allowed.includes(origin) || allowed.includes("*")) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: config.cors.credentials,
      methods: config.cors.methods,
      allowedHeaders: config.cors.allowedHeaders,
      maxAge: config.cors.maxAge,
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ extended: true, limit: "256kb" }));
  app.use(requestLogger);

  mountRoutes(app);

  app.use((req, res) => {
    res.status(404).json({ success: false, error: "Not found", path: req.originalUrl });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  });

  return app;
}

export default createApp;
