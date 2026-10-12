import config from "../config/env.js";

const stores = {};

function getClientKey(req) {
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function pruneExpired(store) {
  const now = Date.now();
  for (const key of Object.keys(store)) {
    if (store[key].resetAt <= now) {
      delete store[key];
    }
  }
}

export function rateLimit(options = {}) {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 100;
  const message = options.message || "Too many requests";

  return (req, res, next) => {
    const store = stores[options.key || "default"] || (stores[(options.key || "default")] = {});
    pruneExpired(store);

    const clientId = getClientKey(req);
    const entry = store[clientId] || { count: 0, resetAt: Date.now() + windowMs };
    entry.count += 1;
    store[clientId] = entry;

    res.set("X-RateLimit-Limit", max);
    res.set("X-RateLimit-Remaining", Math.max(0, max - entry.count));
    res.set("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));

    if (entry.count > max) {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((entry.resetAt - Date.now()) / 1000),
      });
      return;
    }
    next();
  };
}

export { stores };
