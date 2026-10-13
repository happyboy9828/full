import { Router } from "express";
import * as feedbackController from "../controllers/feedbackController.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many feedback submissions, please try again later",
  key: "feedback",
});

router.post("/feedback", feedbackLimiter, feedbackController.submitFeedback);
router.get("/feedback", feedbackController.getFeedback);
router.patch("/feedback/:id", feedbackController.updateFeedbackStatus);

export default router;