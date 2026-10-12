import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { dbState } from "./db/db.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "256kb" }));

  app.get("/", (req, res) => {
    res.json({ success: true, message: "DocFix backend running" });
  });

  app.get("/health", (req, res) => {
    res.json({
      success: true,
      status: "ok",
      database: dbState(),
      dbName: mongoose.connection.name,
      uptime: process.uptime(),
    });
  });

  app.get("/status", async (req, res) => {
    const state = dbState();
    let collections = null;
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        const cols = await mongoose.connection.db.listCollections().toArray();
        collections = cols.map((c) => c.name).sort();
      } catch (err) {
        console.error(err);
      }
    }
    res.json({
      success: true,
      status: "ok",
      database: state,
      dbName: mongoose.connection.name,
      collections,
      uptime: process.uptime(),
    });
  });

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
