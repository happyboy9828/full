import express from "express";
import { trackEvent, trackPageview, startSession, heartbeat, endSession } from "../controllers/analyticsController.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import config from "../config/env.js";

const router = express.Router();

const trackLimiter = createRateLimiter({
  windowMs: config.rateLimit.trackWindowMs,
  max: config.rateLimit.trackMax,
  message: "Too many tracking requests, please slow down",
});

router.post("/track", trackLimiter, trackEvent);
router.post("/pageview", trackLimiter, trackPageview);
router.post("/sessions/start", trackLimiter, startSession);
router.post("/sessions/heartbeat", trackLimiter, heartbeat);
router.post("/sessions/end", trackLimiter, endSession);

export default router;
