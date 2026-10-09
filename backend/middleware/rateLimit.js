import logger from "../utils/logger.js";

export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 100,
  keyGenerator = (req) => req.ip,
  message = "Too many requests",
}) {
  const hits = new Map();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, times] of hits.entries()) {
      const recent = times.filter((t) => now - t < windowMs);
      if (recent.length > 0) hits.set(key, recent);
      else hits.delete(key);
    }
  }, windowMs);
  if (typeof cleanup.unref === "function") cleanup.unref();

  return (req, res, next) => {
    const key = keyGenerator(req);
    if (!key) return next();
    const now = Date.now();
    let times = hits.get(key);
    if (!times) {
      times = [];
      hits.set(key, times);
    }
    const recent = times.filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - recent.length)));
    if (recent.length > max) {
      const retryAfter = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      logger.warn("rate_limit_exceeded", { path: req.originalUrl, retryAfter });
      return res.status(429).json({ success: false, error: message });
    }
    next();
  };
}
