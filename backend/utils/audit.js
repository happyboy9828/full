import crypto from "crypto";
import { AdminActivity } from "../models/index.js";

/**
 * Helpers for writing to the admin audit trail.
 *
 * `logActivity` never throws — a failure to record an audit entry must never
 * break the request that triggered it.
 */

export function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(String(ip)).digest("hex");
}

export function hashUserAgent(userAgent) {
  if (!userAgent) return null;
  return crypto.createHash("sha256").update(String(userAgent)).digest("hex");
}

function clientIp(req) {
  if (!req) return null;
  const forwarded = req.headers?.["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || null;
}

function userAgent(req) {
  if (!req) return null;
  return (req.get?.("user-agent") || req.headers?.["user-agent"] || null)?.slice(0, 255) || null;
}

/**
 * Append an audit record.
 *
 * @param {object} params
 * @param {object} [params.req]    Express request (used for ip / user agent).
 * @param {object} [params.actor]  { id, email, name, role } of the acting admin.
 * @param {string} params.action   Machine-readable action, e.g. "auth.login".
 * @param {string} [params.targetType]
 * @param {string} [params.target]
 * @param {string} [params.status]  "success" | "failure".
 * @param {string} [params.message] Human-readable summary.
 * @param {object} [params.meta]    Extra structured context.
 */
export async function logActivity({
  req,
  actor,
  action,
  targetType = null,
  target = null,
  status = "success",
  message = null,
  meta = null,
} = {}) {
  try {
    await AdminActivity.create({
      actorId: actor?.id || actor?._id || null,
      actorEmail: actor?.email || null,
      actorName: actor?.name || null,
      actorRole: actor?.role || null,
      action,
      targetType,
      target,
      status,
      message,
      meta,
      ipHash: hashIp(clientIp(req)),
      userAgentHash: hashUserAgent(userAgent(req)),
    });
  } catch (error) {
    console.error("[audit] failed to record activity:", error.message);
  }
}

export default logActivity;
