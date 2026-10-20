"use client";

import { useMemo, useState } from "react";
import { Download, MousePointerClick, RefreshCw } from "lucide-react";

import AdminShell from "@/components/AdminShell/AdminShell";
import { PERMISSIONS } from "@/components/AuthProvider/AuthProvider";
import BarList from "@/components/AdminReports/BarList";
import ReportToolbar from "@/components/AdminReports/ReportToolbar";
import ReportStatGrid from "@/components/AdminReports/ReportStatGrid";
import { ReportEmpty, ReportError, ReportLoading, ReportUpdated } from "@/components/AdminReports/ReportStates";
import { reportsApi } from "@/lib/adminApi";
import { useReportQuery } from "@/lib/useReportQuery";
import { buildReportParams, defaultRange, describeRange } from "@/lib/reportParams";
import { formatNumber } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";

import "@/components/AdminReports/AdminReports.css";

const CSV_COLUMNS = [
  { key: "eventType", label: "Event type" },
  { key: "customName", label: "Custom name" },
  { key: "count", label: "Count" },
  { key: "share", label: "Share (%)" },
];

const EVENT_TYPES = [
  "pageview",
  "click",
  "navigation",
  "heartbeat",
  "outbound",
  "custom",
];

/**
 * Events report — how many times each tracked event fired in the window.
 */
export default function EventsModule() {
  const [range, setRange] = useState(() => defaultRange(30));
  const [domain, setDomain] = useState("");
  const [eventType, setEventType] = useState("");

  const params = useMemo(
    () => buildReportParams({ ...range, domain }),
    [range, domain]
  );

  const { data, error, loading, refetch, updatedAt } = useReportQuery(
    reportsApi.events,
    params
  );

  const allRows = useMemo(() => {
    const list = Array.isArray(data?.data) ? data.data : [];
    return [...list].sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0));
  }, [data]);

  const rows = useMemo(
    () => (eventType ? allRows.filter((row) => row.eventType === eventType) : allRows),
    [allRows, eventType]
  );

  const total = rows.reduce((sum, row) => sum + (Number(row.count) || 0), 0);
  const top = rows[0];

  const availableTypes = useMemo(() => {
    const seen = new Set(allRows.map((row) => row.eventType).filter(Boolean));
    EVENT_TYPES.forEach((type) => seen.add(type));
    return Array.from(seen).sort();
  }, [allRows]);

  const csvRows = rows.map((row) => ({
    eventType: row.eventType,
    customName: row.customName || "",
    count: row.count,
    share: total ? Math.round((row.count / total) * 1000) / 10 : 0,
  }));

  return (
    <AdminShell
      title="Events"
      subtitle={`Tracked interactions during ${describeRange(range)}`}
      requirePermission={PERMISSIONS.ANALYTICS_VIEW}
      actions={
        <>
          <ReportUpdated timestamp={updatedAt} loading={loading} />
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
            onClick={() => downloadCsv("docstools-events", CSV_COLUMNS, csvRows)}
            disabled={!csvRows.length}
          >
            <Download size={14} aria-hidden="true" />
            CSV
          </button>
        </>
      }
    >
      <ReportStatGrid
        items={[
          { label: "Total events", value: formatNumber(total) },
          { label: "Event types", value: formatNumber(new Set(rows.map((row) => row.eventType)).size) },
          { label: "Top event", value: top ? top.eventType : "—", meta: top ? `${formatNumber(top.count)} events` : undefined },
          {
            label: "Top share",
            value: top && total ? `${Math.round((top.count / total) * 1000) / 10}%` : "—",
            meta: top?.customName ? top.customName : undefined,
          },
        ]}
      />

      <section className="admin-panel">
        <div className="admin-panel-header">
          <ReportToolbar
            range={range}
            onRangeChange={setRange}
            domain={domain}
            onDomainChange={setDomain}
          >
            <div className="admin-field">
              <label htmlFor="events-type">Event type</label>
              <select
                id="events-type"
                className="admin-select"
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
              >
                <option value="">All types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </ReportToolbar>
        </div>

        <ReportError error={error} onRetry={refetch} />

        <div className="admin-panel-body admin-panel-body--flush">
          {loading && !rows.length ? (
            <ReportLoading label="Loading events…" />
          ) : !rows.length ? (
            <ReportEmpty
              title="No events recorded"
              message="Pageviews, clicks and outbound clicks are counted here as visitors browse the site."
              icon={MousePointerClick}
            />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Event type</th>
                    <th>Custom name</th>
                    <th className="numeric">Count</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const share = total ? (row.count / total) * 100 : 0;
                    return (
                      <tr key={`${row.eventType}-${row.customName || index}`}>
                        <td>
                          <span className={`report-rank ${index < 3 ? "report-rank--top" : ""}`}>
                            {index + 1}
                          </span>
                        </td>
                        <td>
                          <span className={`report-event-badge report-event-badge--${row.eventType || "unknown"}`}>
                            {row.eventType || "unknown"}
                          </span>
                        </td>
                        <td className="admin-cell-primary">
                          <strong>{row.customName || "—"}</strong>
                        </td>
                        <td className="numeric">{formatNumber(row.count)}</td>
                        <td>
                          <div className="report-share">
                            <div className="report-share-track">
                              <div className="report-share-fill" style={{ width: `${Math.min(share, 100)}%` }} />
                            </div>
                            <span className="report-share-value">{share.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title">Top events</div>
          <div className="admin-panel-subtitle">Ten most frequent interactions</div>
        </div>
        <div className="admin-panel-body">
          <BarList
            tone="highlight"
            items={rows.slice(0, 10).map((row) => ({
              label: row.customName ? `${row.eventType} · ${row.customName}` : row.eventType,
              value: formatNumber(row.count),
              percentage: total ? Math.round((row.count / total) * 1000) / 10 : 0,
            }))}
          />
        </div>
      </section>
    </AdminShell>
  );
}
