const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateUUID(v) {
  if (typeof v !== "string") return false;
  return UUID_V4.test(v);
}

const EVENT_TYPES = ["pageview", "click", "navigation", "heartbeat", "outbound", "custom"];

export function validateEventType(v) {
  return EVENT_TYPES.includes(v);
}

export function validateScrollDepth(v) {
  if (v == null) return true;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100;
}

export function validateDuration(v) {
  if (v == null) return true;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 86400;
}

export function validatePayload(req, res, next) {
  const body = req.body;
  if (body && typeof body !== "object") {
    return res.status(400).json({ success: false, error: "Invalid JSON body" });
  }
  next();
}

export function parseDateRange(req, res, next) {
  const q = req.query;
  let startDate = null;
  let endDate = null;

  if (q.startDate) {
    const d = new Date(q.startDate);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ success: false, error: "Invalid startDate" });
    }
    startDate = d;
  }

  if (q.endDate) {
    const d = new Date(q.endDate);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ success: false, error: "Invalid endDate" });
    }
    endDate = d;
  }

  if (startDate && endDate && startDate > endDate) {
    return res.status(400).json({ success: false, error: "startDate must be before endDate" });
  }

  req.dateRange = { startDate, endDate };
  next();
}

export function validateTrackingBody(req, res, next) {
  const body = req.body;
  if (!body) {
    return res.status(400).json({ success: false, error: "Request body is required" });
  }
  if (body.eventType && !validateEventType(body.eventType)) {
    return res.status(400).json({ success: false, error: "Invalid eventType" });
  }
  if (body.visitorId && !validateUUID(body.visitorId)) {
    return res.status(400).json({ success: false, error: "Invalid visitorId format" });
  }
  if (body.sessionId && !validateUUID(body.sessionId)) {
    return res.status(400).json({ success: false, error: "Invalid sessionId format" });
  }
  if (body.scrollDepth != null && !validateScrollDepth(body.scrollDepth)) {
    return res.status(400).json({ success: false, error: "scrollDepth must be 0-100" });
  }
  if (body.duration != null && !validateDuration(body.duration)) {
    return res.status(400).json({ success: false, error: "duration out of range" });
  }
  next();
}
