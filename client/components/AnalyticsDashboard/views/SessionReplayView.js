"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchReport } from "@/lib/analyticsApi";
import DataTable from "../ui/DataTable";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import CsvExportButton from "../ui/CsvExportButton";

const EVENT_TYPE_COLORS = {
  pageview: "var(--tool-accent)",
  click: "var(--tool-success)",
  navigation: "var(--tool-warning)",
  heartbeat: "var(--tool-muted)",
  outbound: "var(--tool-error)",
  custom: "var(--tool-info)",
};

export default function SessionReplayView({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const r = await fetchReport("session-replay", { ...params, sessionId });
        if (!cancelled) {
          if (r.status === 200 && r.json?.success) {
            setData(r.json.data);
          } else if (r.status === 404) {
            setError("Session not found");
          } else {
            setError(r.json?.error || "Failed to load session replay");
          }
        }
      } catch {
        if (!cancelled) setError("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params.startDate, params.endDate, sessionId]);

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    return data.events.filter((e) => !filterType || e.eventType === filterType);
  }, [data, filterType]);

  const csvRows = useMemo(() => {
    if (!data) return [];
    return filteredEvents.map((e) => ({
      Time: new Date(e.timestamp).toLocaleTimeString(),
      Type: e.eventType,
      Path: e.path || "",
      Title: e.title || "",
      "Custom Name": e.customName || "",
      Duration: e.duration || "",
      "Scroll Depth": e.scrollDepth || "",
      Referrer: e.referrer || "",
    }));
  }, [filteredEvents]);

  const eventTypes = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.events.map((e) => e.eventType))].sort();
  }, [data]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) {
    return (
      <div className="tool-card">
        <p className="tool-card-title" style={{ margin: "0 0 10px" }}>Session Replay</p>
        <p className="tool-muted" style={{ margin: "0 0 16px" }}>
          Enter a Session ID to view the complete event timeline for that session.
          Sensitive fields (passwords, tokens, emails, etc.) are automatically redacted.
        </p>
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="tool-input"
          placeholder="Enter session ID (UUID)"
          style={{ maxWidth: 400 }}
        />
      </div>
    );
  }

  if (!filteredEvents.length) return <EmptyState message={filterType ? `No ${filterType} events in this session` : "No events in this session"} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--tool-gap)" }}>
      <div className="tool-card">
        <div className="tool-row" style={{ gap: "var(--tool-gap)", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <label className="tool-label" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Session ID</label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="tool-input"
              placeholder="Enter session ID (UUID)"
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <label className="tool-label" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Filter by Event Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="tool-input">
              <option value="">All Events</option>
              {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="tool-card" style={{ overflow: "hidden" }}>
        <div className="tool-row" style={{ padding: "var(--tool-card-pad)", borderBottom: "1px solid var(--tool-border)" }}>
          <div>
            <p className="tool-card-title" style={{ margin: 0 }}>Session: {data.session.sessionId.substring(0, 8)}…</p>
            <p className="tool-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
              Visitor: {data.session.visitorId.substring(0, 8)}… |{" "}
              {data.session.deviceType} / {data.session.browser} / {data.session.os} |{" "}
              Started: {new Date(data.session.startedAt).toLocaleString()} |{" "}
              Duration: {data.session.duration}s |{" "}
              Pages: {filteredEvents.filter((e) => e.eventType === "pageview").length}
            </p>
          </div>
          <CsvExportButton filename={`session-replay-${data.session.sessionId.substring(0, 8)}-${params.startDate || "custom"}-to-${params.endDate || "custom"}.csv`} rows={csvRows} />
        </div>
        <DataTable
          columns={[
            { key: "timestamp", header: "Time", width: 100, render: (row) => new Date(row.timestamp).toLocaleTimeString() },
            { key: "eventType", header: "Type", width: 100, render: (row) => (
              <span style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "var(--tool-radius)",
                fontSize: 11,
                fontWeight: 600,
                background: EVENT_TYPE_COLORS[row.eventType] + "20",
                color: EVENT_TYPE_COLORS[row.eventType],
              }}>
                {row.eventType}
              </span>
            ) },
            { key: "path", header: "Path", width: 200 },
            { key: "title", header: "Title", width: 200 },
            { key: "customName", header: "Custom Event", width: 150 },
            { key: "duration", header: "Duration (s)", align: "right", width: 100 },
            { key: "scrollDepth", header: "Scroll %", align: "right", width: 80 },
            { key: "referrer", header: "Referrer", width: 200, render: (row) => row.referrer ? new URL(row.referrer).hostname : "-" },
          ]}
          rows={filteredEvents}
        />
      </div>

      {data.session.events && (
        <details className="tool-card" style={{ marginTop: "var(--tool-gap)" }}>
          <summary className="tool-muted" style={{ cursor: "pointer", padding: "var(--tool-card-pad)" }}>
            Raw Event Data (JSON) — {data.events.length} events
          </summary>
          <pre style={{ padding: "var(--tool-card-pad)", overflow: "auto", fontSize: 11, background: "var(--tool-surface-2)", borderTop: "1px solid var(--tool-border)" }}>
            {JSON.stringify(data.events, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}