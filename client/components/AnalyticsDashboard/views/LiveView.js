"use client";

import { useEffect } from "react";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import CsvExportButton from "../ui/CsvExportButton";
import useReport from "@/lib/useReport";

const RECENT_COLUMNS = [
  { key: "timestamp", label: "Time", render: (v) => formatTime(v) },
  { key: "path", label: "Path" },
  { key: "eventType", label: "Event Type" },
];

export default function LiveView({ params }) {
  const report = useReport("live", params);

  useEffect(() => {
    const interval = setInterval(() => {
      report.refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [report]);

  if (report.loading) return <LoadingState message="Connecting to live feed…" />;
  if (report.error) return <ErrorState error={report.error} onRetry={report.refetch} />;

  const data = report.data || {};
  const activeSessions = data.activeSessions || 0;
  const activeVisitors = data.activeVisitors || 0;
  const recentEvents = data.recentEvents || [];

  return (
    <div className="tool-col" style={{ gap: "var(--tool-gap)" }}>
      <div
        className="tool-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        <div className="tool-card">
          <p className="tool-muted" style={{ margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Active Visitors
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 32, fontWeight: 700 }}>{activeVisitors}</p>
        </div>
        <div className="tool-card">
          <p className="tool-muted" style={{ margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Active Sessions
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 32, fontWeight: 700 }}>{activeSessions}</p>
        </div>
      </div>

      <div className="tool-card">
        <p className="tool-card-title">Recent Events</p>
        {recentEvents.length === 0 ? (
          <EmptyState title="No recent activity" description="No events in the last 5 minutes." />
        ) : (
          <>
            {recentEvents.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <CsvExportButton data={recentEvents} filename="recent-events" columns={RECENT_COLUMNS.map((c) => c.key)} />
              </div>
            )}
            <div style={{ overflowX: "auto" }}>
              <table className="tool-datatable">
                <thead>
                  <tr>
                    {RECENT_COLUMNS.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((e, i) => (
                    <tr key={e.eventId || e.timestamp + i}>
                      {RECENT_COLUMNS.map((col) => (
                        <td key={col.key}>
                          {col.render ? col.render(e[col.key], e) : formatCellValue(e[col.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <style>{`
              .tool-datatable { width: 100%; border-collapse: collapse; font-size: 13px; }
              .tool-datatable th, .tool-datatable td { padding: 8px 10px; text-align: left; border-bottom: 1px solid var(--tool-border); }
              .tool-datatable th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--tool-muted); }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatCellValue(value) {
  if (value == null) return "—";
  return String(value);
}
