"use client";

import { RefreshCw, Server } from "lucide-react";

import AdminShell from "@/components/AdminShell/AdminShell";
import { PERMISSIONS } from "@/components/AuthProvider/AuthProvider";
import { adminApi } from "@/lib/adminApi";
import { useAdminQuery } from "@/lib/useAdminQuery";
import { formatDate, formatNumber } from "@/lib/format";

/**
 * System statistics — runtime health, resource usage and collection counts.
 */
export default function SystemPage() {
  const { data, error, loading, refetch } = useAdminQuery(adminApi.systemStats, {});
  const stats = data?.data;

  return (
    <AdminShell
      title="System"
      subtitle="Runtime health, resources and collection counts"
      requirePermission={PERMISSIONS.SYSTEM_VIEW}
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
      {error ? (
        <div className="admin-error" role="alert">
          {error.message || "Could not load system statistics"}
        </div>
      ) : null}

      {!stats && loading ? (
        <section className="admin-panel">
          <div className="admin-empty">
            <p>Loading system statistics…</p>
          </div>
        </section>
      ) : null}

      {stats ? (
        <>
          <section className="admin-stat-grid" aria-label="Key system counters">
            <div className="admin-stat">
              <div className="admin-stat-label">Administrators</div>
              <div className="admin-stat-value">{formatNumber(stats.counts.activeAdministrators)}</div>
              <div className="admin-stat-meta">
                {formatNumber(stats.counts.administrators)} total ·{" "}
                {formatNumber(stats.counts.activeAdminSessions)} active sessions
              </div>
            </div>

            <div className="admin-stat">
              <div className="admin-stat-label">Application users</div>
              <div className="admin-stat-value">{formatNumber(stats.counts.activeAppUsers)}</div>
              <div className="admin-stat-meta">
                {formatNumber(stats.counts.appUsers)} total accounts
              </div>
            </div>

            <div className="admin-stat">
              <div className="admin-stat-label">Tracked events</div>
              <div className="admin-stat-value">{formatNumber(stats.counts.events, { compact: true })}</div>
              <div className="admin-stat-meta">
                {formatNumber(stats.counts.visitorSessions, { compact: true })} visitor sessions
              </div>
            </div>

            <div className="admin-stat">
              <div className="admin-stat-label">Audit entries</div>
              <div className="admin-stat-value">
                {formatNumber(stats.counts.activityEntries, { compact: true })}
              </div>
              <div className="admin-stat-meta">
                {formatNumber(stats.counts.failuresLast24h)} failures in the last 24h
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2 className="admin-panel-title">Runtime</h2>
                <p className="admin-panel-subtitle">
                  Generated {formatDate(stats.generatedAt, { withTime: true })}
                </p>
              </div>
              <span
                className={`admin-badge admin-badge--${
                  stats.database.state === "connected" ? "active" : "suspended"
                }`}
              >
                db: {stats.database.state}
              </span>
            </div>
            <div className="admin-panel-body">
              <div className="admin-stat-grid">
                <div className="admin-stat">
                  <div className="admin-stat-label">Uptime</div>
                  <div className="admin-stat-value">{stats.server.uptime}</div>
                  <div className="admin-stat-meta">
                    {stats.server.environment} · node {stats.server.nodeVersion}
                  </div>
                </div>

                <div className="admin-stat">
                  <div className="admin-stat-label">Memory (RSS)</div>
                  <div className="admin-stat-value">{stats.memory.rssFormatted}</div>
                  <div className="admin-stat-meta">
                    heap {stats.memory.heapUsedFormatted} of {stats.memory.heapTotalFormatted}
                  </div>
                </div>

                <div className="admin-stat">
                  <div className="admin-stat-label">System memory</div>
                  <div className="admin-stat-value">{stats.memory.systemTotalFormatted}</div>
                  <div className="admin-stat-meta">
                    {stats.memory.cpus} CPUs · load {stats.memory.cpuLoad ?? "—"}
                  </div>
                </div>

                <div className="admin-stat">
                  <div className="admin-stat-label">Database</div>
                  <div className="admin-stat-value" style={{ fontSize: "18px" }}>
                    {stats.database.name}
                  </div>
                  <div className="admin-stat-meta">
                    {stats.database.host || "—"}
                    {stats.database.storage ? ` · ${stats.database.storage.size}` : ""}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2 className="admin-panel-title">Most frequent actions</h2>
                <p className="admin-panel-subtitle">Top activity recorded in the audit trail</p>
              </div>
            </div>
            <div className="admin-panel-body admin-panel-body--flush">
              {stats.topActions.length === 0 ? (
                <div className="admin-empty">
                  <Server size={28} aria-hidden="true" />
                  <h3>Nothing recorded yet</h3>
                  <p>Administrative actions will be counted here.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th className="numeric">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topActions.map((entry) => (
                        <tr key={entry.action}>
                          <td className="admin-mono">{entry.action}</td>
                          <td className="numeric">{formatNumber(entry.count)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      ) : null}
    </AdminShell>
  );
}
