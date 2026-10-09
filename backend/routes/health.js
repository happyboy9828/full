import express from "express";
import mongoose from "mongoose";
import { dbStateLabel } from "../db/db.js";
import config from "../config/env.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "DocFix Analytics Backend",
    status: "success",
  });
});

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get("/status", async (req, res) => {
  try {
    res.json({
      database: dbStateLabel(),
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      database: "error",
      error: error.message,
      status: "error",
    });
  }
});

router.get("/api/analytics/health", async (req, res) => {
  try {
    res.json({
      service: "analytics",
      database: dbStateLabel(),
      models: ["Site", "Session", "Event", "AdminSession", "DailyStats"],
      rateLimit: {
        track: `${config.rateLimit.trackMax} req/${config.rateLimit.trackWindowMs / 1000}s`,
      },
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      service: "analytics",
      database: "error",
      error: error.message,
      status: "error",
    });
  }
});

export default router;
