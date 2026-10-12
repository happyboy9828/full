import { Router } from "express";
import * as analyticsController from "../controllers/analyticsController.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { validateTrackingBody } from "../middleware/validate.js";

const router = Router({ mergeParams: true });

const trackLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  message: "Tracking rate limit exceeded",
  key: "track",
});

const sessionLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  message: "Session rate limit exceeded",
  key: "session",
});

router.get("/health", analyticsController.health);

router.post("/track", trackLimiter, validateTrackingBody, analyticsController.track);
router.post("/pageview", trackLimiter, validateTrackingBody, analyticsController.pageview);

router.post("/sessions/start", sessionLimiter, validateTrackingBody, analyticsController.startSession);
router.post("/sessions/heartbeat", sessionLimiter, analyticsController.heartbeat);
router.post("/sessions/end", sessionLimiter, analyticsController.endSession);
router.post("/sessions/mark-stale-inactive", analyticsController.markStaleInactive);

export default router;
