import { Router } from "express";
import {
  overview,
  sources,
  pages,
  devices,
  events,
  live,
  timeSeries,
  funnel,
  retention,
  heatmap,
  sessionReplay,
  returningVisitors,
  recentVisitors,
} from "../controllers/reportsController.js";
import { requireAdmin } from "../middleware/auth.js";
import { parseDateRange } from "../middleware/validate.js";

const router = Router({ mergeParams: true });

router.use(requireAdmin);
router.use(parseDateRange);

router.get("/overview", overview);
router.get("/sources", sources);
router.get("/pages", pages);
router.get("/devices", devices);
router.get("/events", events);
router.get("/live", live);
router.get("/time-series", timeSeries);
router.get("/funnel", funnel);
router.get("/retention", retention);
router.get("/heatmap", heatmap);
router.get("/session-replay", sessionReplay);
router.get("/returning-visitors", returningVisitors);
router.get("/recent-visitors", recentVisitors);

export default router;
