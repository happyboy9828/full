const EVENT_TYPES = ["pageview", "click", "navigation", "heartbeat", "outbound", "custom"];
const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export { EVENT_TYPES };

function isUuid(value) {
  return typeof value === "string" && UUID_V4_RE.test(value);
}

function isOptionalString(value, maxLength) {
  if (value == null) return true;
  if (typeof value !== "string") return false;
  return value.length <= maxLength;
}

function isOptionalNumber(value) {
  if (value == null) return true;
  return typeof value === "number" && Number.isFinite(value);
}

export function validateTrackPayload(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be a JSON object"];
  }
  if (!body.eventType || !EVENT_TYPES.includes(body.eventType)) {
    errors.push(`eventType must be one of: ${EVENT_TYPES.join(", ")}`);
  }
  if (!isUuid(body.sessionId)) errors.push("sessionId is required and must be a UUID v4");
  if (!isUuid(body.visitorId)) errors.push("visitorId is required and must be a UUID v4");
  if (!isOptionalString(body.path, 500)) errors.push("path must be a string (max 500 chars)");
  if (!isOptionalString(body.url, 2048)) errors.push("url must be a string (max 2048 chars)");
  if (!isOptionalString(body.title, 300)) errors.push("title must be a string (max 300 chars)");
  if (!isOptionalString(body.referrer, 2048)) errors.push("referrer must be a string (max 2048 chars)");
  if (!isOptionalString(body.previousPath, 500)) errors.push("previousPath must be a string (max 500 chars)");
  if (!isOptionalString(body.domain, 255)) errors.push("domain must be a string (max 255 chars)");
  if (body.element != null && (typeof body.element !== "object" || Array.isArray(body.element))) {
    errors.push("element must be an object");
  }
  if (body.eventType === "custom") {
    if (typeof body.customName !== "string" || body.customName.trim().length === 0) {
      errors.push("customName is required for custom events");
    } else if (body.customName.length > 100) {
      errors.push("customName must be a string (max 100 chars)");
    }
  }
  if (body.customData != null && (typeof body.customData !== "object" || Array.isArray(body.customData))) {
    errors.push("customData must be an object");
  }
  if (!isOptionalNumber(body.duration) || (body.duration != null && body.duration < 0)) {
    errors.push("duration must be a non-negative number");
  }
  if (
    body.scrollDepth != null &&
    (typeof body.scrollDepth !== "number" || !Number.isFinite(body.scrollDepth) || body.scrollDepth < 0 || body.scrollDepth > 100)
  ) {
    errors.push("scrollDepth must be a number between 0 and 100");
  }
  return errors;
}

export function validatePageviewPayload(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be a JSON object"];
  }
  if (!isUuid(body.sessionId)) errors.push("sessionId is required and must be a UUID v4");
  if (!isUuid(body.visitorId)) errors.push("visitorId is required and must be a UUID v4");
  if (!isOptionalString(body.path, 500)) errors.push("path must be a string (max 500 chars)");
  if (!isOptionalString(body.url, 2048)) errors.push("url must be a string (max 2048 chars)");
  if (!isOptionalString(body.title, 300)) errors.push("title must be a string (max 300 chars)");
  if (!isOptionalString(body.referrer, 2048)) errors.push("referrer must be a string (max 2048 chars)");
  if (!isOptionalString(body.previousPath, 500)) errors.push("previousPath must be a string (max 500 chars)");
  if (!isOptionalString(body.domain, 255)) errors.push("domain must be a string (max 255 chars)");
  return errors;
}

export function validateSessionStartPayload(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be a JSON object"];
  }
  if (!isUuid(body.sessionId)) errors.push("sessionId is required and must be a UUID v4");
  if (!isUuid(body.visitorId)) errors.push("visitorId is required and must be a UUID v4");
  if (!isOptionalString(body.path, 500)) errors.push("path must be a string (max 500 chars)");
  if (!isOptionalString(body.url, 2048)) errors.push("url must be a string (max 2048 chars)");
  if (!isOptionalString(body.referrer, 2048)) errors.push("referrer must be a string (max 2048 chars)");
  if (!isOptionalString(body.domain, 255)) errors.push("domain must be a string (max 255 chars)");
  for (const field of ["utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent"]) {
    if (!isOptionalString(body[field], 255)) errors.push(`${field} must be a string (max 255 chars)`);
  }
  for (const field of ["screenWidth", "screenHeight", "viewportWidth", "viewportHeight"]) {
    if (!isOptionalNumber(body[field])) errors.push(`${field} must be a number`);
  }
  if (body.country != null && !isOptionalString(body.country, 100)) {
    errors.push("country must be a string (max 100 chars)");
  }
  return errors;
}

export function validateHeartbeatPayload(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be a JSON object"];
  }
  if (!isUuid(body.sessionId)) errors.push("sessionId is required and must be a UUID v4");
  if (!isOptionalNumber(body.duration) || (body.duration != null && body.duration < 0)) {
    errors.push("duration must be a non-negative number");
  }
  if (
    body.scrollDepth != null &&
    (typeof body.scrollDepth !== "number" || !Number.isFinite(body.scrollDepth) || body.scrollDepth < 0 || body.scrollDepth > 100)
  ) {
    errors.push("scrollDepth must be a number between 0 and 100");
  }
  return errors;
}

export function validateEndSessionPayload(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be a JSON object"];
  }
  if (!isUuid(body.sessionId)) errors.push("sessionId is required and must be a UUID v4");
  if (!isOptionalString(body.exitPage, 500)) errors.push("exitPage must be a string (max 500 chars)");
  return errors;
}

export function validateLoginPayload(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be a JSON object"];
  }
  if (typeof body.password !== "string" || body.password.length === 0 || body.password.length > 1024) {
    errors.push("password is required");
  }
  return errors;
}

export function parseReportRange(query) {
  const errors = [];
  const end = query.endDate ? new Date(query.endDate) : new Date();
  const start = query.startDate
    ? new Date(query.startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  if (query.startDate && Number.isNaN(start.getTime())) errors.push("startDate must be a valid ISO 8601 date");
  if (query.endDate && Number.isNaN(end.getTime())) errors.push("endDate must be a valid ISO 8601 date");
  if (errors.length === 0 && start.getTime() > end.getTime()) {
    errors.push("startDate must not be after endDate");
  }
  if (errors.length === 0 && end.getTime() - start.getTime() > 366 * 24 * 60 * 60 * 1000) {
    errors.push("Date range cannot exceed 366 days");
  }
  let granularity = "day";
  if (query.granularity != null) {
    if (query.granularity === "hour") granularity = "hour";
    else if (query.granularity !== "day") errors.push("granularity must be 'day' or 'hour'");
  }
  if (errors.length === 0 && granularity === "hour" && end.getTime() - start.getTime() > 7 * 24 * 60 * 60 * 1000) {
    errors.push("Hourly granularity cannot exceed 7 days");
  }
  let limit = 50;
  if (query.limit != null) {
    const parsed = Number(query.limit);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 200) {
      errors.push("limit must be a number between 1 and 200");
    } else {
      limit = parsed;
    }
  }
  return {
    errors,
    start,
    end,
    domain: typeof query.domain === "string" && query.domain.trim() ? query.domain.trim() : null,
    granularity,
    limit,
  };
}
