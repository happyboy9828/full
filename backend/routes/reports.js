import express from "express";
import { overview, sources, pages, devices, eventsReport, live, timeSeries, recentVisitors, funnel, retention, heatmap, sessionReplay, returningVisitors } from "../controllers/reportsController.js";
import { requireAdmin } from "../middleware/auth.js";
import { parseReportRange } from "../middleware/validate.js";

const router = express.Router();

function withRange(handler) {
  return (req, res, next) => {
    const range = parseReportRange(req.query);
    if (range.errors.length) {
      return res.status(400).json({ success: false, errors: range.errors });
    }
    req.range = range;
    handler(req, res, next);
  };
}

router.use(requireAdmin);

router.get("/overview", withRange(overview));
router.get("/sources", withRange(sources));
router.get("/pages", withRange(pages));
router.get("/devices", withRange(devices));
router.get("/events", withRange(eventsReport));
router.get("/live", withRange(live));
router.get("/time-series", withRange(timeSeries));
router.get("/recent-visitors", withRange(recentVisitors));
router.get("/funnel", withRange(funnel));
router.get("/retention", withRange(retention));
router.get("/heatmap", withRange(heatmap));
router.get("/session-replay", withRange(sessionReplay));
router.get("/returning-visitors", withRange(returningVisitors));

export default router;
