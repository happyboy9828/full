import { Router } from "express";
import { dbState } from "../db/db.js";
import mongoose from "mongoose";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DocFix backend running",
  });
});

router.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    database: dbState(),
    dbName: mongoose.connection.name,
    uptime: process.uptime(),
  });
});

router.get("/status", async (req, res) => {
  const state = dbState();
  let collections = null;
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    try {
      const cols = await mongoose.connection.db.listCollections().toArray();
      collections = cols.map((c) => c.name).sort();
    } catch {
      /* ignore */
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

export default router;
