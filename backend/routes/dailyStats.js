import { Router } from "express";
import { compute, getDailyStats } from "../controllers/dailyStatsController.js";
import { requireAdmin } from "../middleware/auth.js";
import { parseDateRange } from "../middleware/validate.js";

const router = Router({ mergeParams: true });

router.post("/compute", requireAdmin, compute);
router.get("/", requireAdmin, parseDateRange, getDailyStats);

export default router;
