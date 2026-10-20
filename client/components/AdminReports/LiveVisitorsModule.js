"use client";

import { useMemo, useState } from "react";
import { Download, Radio, RefreshCw } from "lucide-react";

import AdminShell from "@/components/AdminShell/AdminShell";
import { PERMISSIONS } from "@/components/AuthProvider/AuthProvider";
import ReportToolbar from "@/components/AdminReports/ReportToolbar";
import ReportStatGrid from "@/components/AdminReports/ReportStatGrid";
import { ReportEmpty, ReportError, ReportLoading, ReportUpdated } from "@/components/AdminReports/ReportStates";
import { reportsApi } from "@/lib/adminApi";
import { useReportQuery } from "@/lib/useReportQuery";
import { buildReportParams } from "@/lib/reportParams";
import { formatNumber, formatRelative } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";

import "@/components/AdminReports/AdminReports.css";

const POLL_MS = 15000;

const CSV_COLUMNS = [
  { key: "timestamp", label: "Timestamp" },
  { key: "eventType", label: "Event type" },
  { key: "path", label: "Path" },
  { key: "visitorId", label: "Visitor" },
];

/**
 * Live visitors report — sessions active in the last five minutes plus the
 * most recent events.
 *
 * The backend always looks at a rolling five-minute window, so this module
 * deliberately offers no date filter — only the domain filter applies.
 */
export default function LiveVisitorsModule() {
  const [domain, setDomain] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const params = useMemo(() => buildReportParams({ domain }), [domain]);

  const { data, error, loading, refetch, updatedAt } = useReportQuery(
    reportsApi.live,
    params,
    { pollMs: autoRefresh ? POLL_MS : 0 }
  );

  const activeVisitors = Number(data?.data?.activeVisitors) || 0;
  const activeSessions = Number(data?.data?.activeSessions) || 0;
  const events = useMemo(() => data?.data?.recentEvents || [], [data]);

  const eventCounts = useMemo(() => {
    const counts = {};
    events.forEach((event) => {
      const key = event.eventType || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [events]);

  return (
    <AdminShell
      title="Live Visitors"
      subtitle="Sessions active in the last five minutes"
      requirePermission={PERMISSIONS.ANALYTICS_VIEW}
      actions={
        <>
          <ReportUpdated timestamp={updatedAt} loading={loading} />
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--sm"
            onClick={() => setAutoRefresh((value) => !value)}
            aria-pressed={autoRefresh}
          >
            <Radio size={14} aria-hidden="true" />
            {autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
          </button>
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--sm"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--sm"
            onClick={() => downloadCsv("docstools-live-events", CSV_COLUMNS, events)}
            disabled={!events.length}
          >
            <Download size={14} aria-hidden="true" />
            CSV
          </button>
        </>
      }
    >
      <ReportStatGrid
        items={[
          { label: "Active visitors", value: formatNumber(activeVisitors) },
          { label: "Active sessions", value: formatNumber(activeSessions) },
          { label: "Recent events", value: formatNumber(events.length), meta: "last 5 minutes" },
          {
            label: "Top event",
            value: eventCounts[0] ? eventCounts[0][0] : "—",
            meta: eventCounts[0] ? `${eventCounts[0][1]} in the feed` : undefined,
          },
        ]}
      />

      <section className="admin-panel">
        <div className="admin-panel-header">
          <ReportToolbar
            showRange={false}
            domain={domain}
            onDomainChange={setDomain}
          />
        </div>

        <ReportError error={error} onRetry={refetch} />

        <div className="admin-panel-body admin-panel-body--flush">
          {loading && !events.length ? (
            <ReportLoading label="Loading live activity…" />
          ) : !events.length ? (
            <ReportEmpty
              title="Nobody is browsing right now"
              message="Live events appear here the moment a visitor interacts with the site."
              icon={Radio}
            />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Event</th>
                    <th>Path</th>
                    <th>Visitor</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, index) => (
                    <tr key={event.eventId || `${event.timestamp}-${index}`}>
                      <td className="admin-cell-muted">{formatRelative(event.timestamp)}</td>
                      <td>
                        <span className={`report-event-badge report-event-badge--${event.eventType || "unknown"}`}>
                          {event.eventType || "unknown"}
                        </span>
                      </td>
                      <td>
                        <span className="report-feed-path">{event.path || "/"}</span>
                      </td>
                      <td className="admin-cell-muted admin-mono">
                        {event.visitorId ? `${String(event.visitorId).slice(0, 8)}…` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
