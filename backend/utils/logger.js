const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const level = LOG_LEVELS[String(process.env.LOG_LEVEL || "").toLowerCase()]
  ?? (process.env.NODE_ENV === "production" ? LOG_LEVELS.info : LOG_LEVELS.debug);

function log(levelName, message, meta) {
  if (LOG_LEVELS[levelName] < level) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level: levelName,
    message,
    ...meta,
  };
  const line = JSON.stringify(entry);
  if (levelName === "error") console.error(line);
  else if (levelName === "warn") console.warn(line);
  else console.log(line);
}

const logger = {
  debug: (message, meta) => log("debug", message, meta),
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
};

export default logger;

export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    logger.info("http_request", {
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
    });
  });
  next();
}
