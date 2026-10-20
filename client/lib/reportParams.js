"use client";

/**
 * Report query helpers shared by the analytics modules.
 *
 * The backend parses `startDate` / `endDate` with `new Date(value)`. A bare
 * `YYYY-MM-DD` is therefore read as midnight UTC, which would silently drop
 * everything that happened on the final day of the range. The helpers below
 * widen the window explicitly so the selected days are inclusive.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Today as `YYYY-MM-DD` (UTC). */
export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

/** `YYYY-MM-DD` for the day `days` before today (UTC). */
export function daysAgoStamp(days) {
  return new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);
}

/** The default window: the last `days` days, ending today. */
export function defaultRange(days = 30) {
  return { startDate: daysAgoStamp(days), endDate: todayStamp() };
}

/** Inclusive start of the selected day, as a UTC ISO timestamp. */
export function toUtcStartOfDay(dateString) {
  if (!dateString) return undefined;
  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

/** Inclusive end of the selected day, as a UTC ISO timestamp. */
export function toUtcEndOfDay(dateString) {
  if (!dateString) return undefined;
  const date = new Date(`${dateString}T23:59:59.999Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

/**
 * Builds the query parameters every report endpoint understands.
 *
 * `startDate` / `endDate` are `YYYY-MM-DD` strings; `domain` is the hostname
 * captured by the tracking client (for example `docstools.app`).
 */
export function buildReportParams({ startDate, endDate, domain, ...rest } = {}) {
  const params = {
    startDate: toUtcStartOfDay(startDate),
    endDate: toUtcEndOfDay(endDate),
    domain: domain ? domain.trim() : undefined,
  };

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });

  return params;
}

/** Human label for the active window, used in panel subtitles. */
export function describeRange({ startDate, endDate } = {}) {
  if (!startDate && !endDate) return "Last 30 days";
  if (startDate && endDate) return `${startDate} → ${endDate}`;
  if (startDate) return `From ${startDate}`;
  return `Until ${endDate}`;
}
