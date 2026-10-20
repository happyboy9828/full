"use client";

import { useMemo, useState } from "react";
import { RefreshCw, ScrollText, Search } from "lucide-react";

import AdminShell from "@/components/AdminShell/AdminShell";
import { PERMISSIONS } from "@/components/AuthProvider/AuthProvider";
import { adminApi } from "@/lib/adminApi";
import { useAdminQuery } from "@/lib/useAdminQuery";
import { formatDate } from "@/lib/format";

/**
 * Audit trail viewer.
 *
 * Every administrative action — including authentication attempts — is
 * recorded server-side and surfaced here.
 */
export default function ActivityPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({ search: search.trim(), action, status, page, limit: 30 }),
    [search, action, status, page]
  );

  const { data, error, loading, refetch } = useAdminQuery(adminApi.listActivity, params);

  const entries = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const facets = data?.facets || [];

  return (
    <AdminShell
      title="Activity Log"
      subtitle="Every administrative action is recorded"
      requirePermission={PERMISSIONS.ACTIVITY_VIEW}
      actions={
        <button
          type="button"
          className="admin-button admin-button--ghost admin-button--sm"
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw size={14} aria-hidden="true" />
          Refresh
        </button>
      }
    >
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-toolbar">
            <div className="admin-field">
              <label htmlFor="activity-search">Search</label>
              <div className="admin-search-field">
                <Search size={14} aria-hidden="true" />
                <input
                  id="activity-search"
                  type="search"
                  className="admin-input admin-input--search"
                  placeholder="Action, actor or target"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="activity-action">Action</label>
              <select
                id="activity-action"
                className="admin-select"
                value={action}
                onChange={(event) => {
                  setAction(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All actions</option>
                {facets.map((facet) => (
                  <option key={facet.action} value={facet.action}>
                    {facet.action} ({facet.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="activity-status">Result</label>
              <select
                id="activity-status"
                className="admin-select"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All results</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="admin-error admin-panel-message" role="alert">
            {error.message || "Could not load the activity log"}
          </div>
        ) : null}

        <div className="admin-panel-body admin-panel-body--flush">
          {loading && entries.length === 0 ? (
            <div className="admin-empty">
              <p>Loading activity…</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="admin-empty">
              <ScrollText size={28} aria-hidden="true" />
              <h3>No activity recorded</h3>
              <p>Administrative actions will appear here as they happen.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Result</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry._id}>
                      <td className="admin-cell-muted">{formatDate(entry.createdAt, { withTime: true })}</td>
                      <td>
                        <div className="admin-cell-primary">
                          <strong>{entry.actorName || entry.actorEmail || "System"}</strong>
                          {entry.actorRole ? (
                            <span className={`admin-badge admin-badge--${entry.actorRole}`}>
                              {entry.actorRole}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span className="admin-mono">{entry.action}</span>
                      </td>
                      <td className="admin-cell-muted">{entry.target || "—"}</td>
                      <td>
                        <span className={`admin-badge admin-badge--${entry.status}`}>{entry.status}</span>
                      </td>
                      <td className="admin-cell-muted">{entry.message || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-pagination">
          <span>
            {pagination.total} entr{pagination.total === 1 ? "y" : "ies"} · page {pagination.page} of{" "}
            {pagination.totalPages}
          </span>
          <div className="admin-pagination-actions">
            <button
              type="button"
              className="admin-button admin-button--ghost admin-button--sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={pagination.page <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost admin-button--sm"
              onClick={() => setPage((current) => current + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
