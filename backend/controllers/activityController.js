import { AdminActivity } from "../models/index.js";
import { escapeRegExp } from "./adminUsersController.js";

/**
 * Activity log (audit trail) endpoint.
 *
 * Read-only: there is no write path other than `utils/audit.js`.
 */

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 200;

function clampLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function clampPage(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return parsed;
}

export async function listActivity(req, res) {
  const { search = "", action = "", status = "", actor = "", page, limit, from, to } = req.query;

  const filter = {};

  if (action && String(action).trim()) {
    filter.action = new RegExp(`^${escapeRegExp(String(action).trim())}$`, "i");
  }
  if (status === "success" || status === "failure") {
    filter.status = status;
  }
  if (actor && String(actor).trim()) {
    filter.actorEmail = new RegExp(escapeRegExp(String(actor).trim()), "i");
  }
  if (search && String(search).trim()) {
    const rx = new RegExp(escapeRegExp(String(search).trim()), "i");
    filter.$or = [{ action: rx }, { message: rx }, { actorEmail: rx }, { target: rx }];
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) {
      const start = new Date(from);
      if (!Number.isNaN(start.getTime())) filter.createdAt.$gte = start;
    }
    if (to) {
      const end = new Date(to);
      if (!Number.isNaN(end.getTime())) filter.createdAt.$lte = end;
    }
    if (!Object.keys(filter.createdAt).length) delete filter.createdAt;
  }

  const currentPage = clampPage(page);
  const perPage = clampLimit(limit);

  try {
    const [entries, total, actionFacets] = await Promise.all([
      AdminActivity.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .lean(),
      AdminActivity.countDocuments(filter),
      AdminActivity.aggregate([
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
    ]);

    return res.json({
      success: true,
      data: entries,
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
      },
      facets: actionFacets.map((facet) => ({ action: facet._id, count: facet.count })),
    });
  } catch (err) {
    console.error("[admin] listActivity failed:", err);
    return res.status(500).json({ success: false, error: "Could not load activity log" });
  }
}
