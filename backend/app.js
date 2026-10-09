import express from "express";
import cors from "cors";
import config from "./config/env.js";
import logger, { requestLogger } from "./utils/logger.js";
import router from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);

  app.use(
    cors({
      origin: config.corsOrigins.length > 0 ? config.corsOrigins : false,
      credentials: true,
    })
  );
  app.use(express.json({ limit: config.bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));
  app.use(requestLogger);

  app.use("/", router);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: "Not found",
      path: req.originalUrl,
    });
  });

  app.use((err, req, res, next) => {
    if (err && err.type === "entity.parse.failed") {
      return res.status(400).json({ success: false, error: "Invalid JSON body" });
    }
    if (err && err.type === "entity.too.large") {
      return res.status(413).json({ success: false, error: "Request body too large" });
    }
    logger.error("unhandled_error", {
      error: err && err.message,
      path: req.originalUrl,
      stack: err && err.stack,
    });
    res.status(err && err.status ? err.status : 500).json({
      success: false,
      error: err && err.message ? err.message : "Internal server error",
    });
  });

  return app;
}

export default createApp;
