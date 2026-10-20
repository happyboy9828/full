"use client";

import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";

import "./AdminReports.css";

/** Inline error strip for a report panel. */
export function ReportError({ error, onRetry }) {
  if (!error) return null;

  return (
    <div className="admin-error admin-panel-message" role="alert">
      <AlertTriangle size={14} aria-hidden="true" />
      <span>{error.message || "Could not load this report"}</span>
      {onRetry ? (
        <button
          type="button"
          className="admin-button admin-button--ghost admin-button--sm"
          onClick={onRetry}
        >
          <RefreshCw size={13} aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </div>
  );
}

/** Loading placeholder for a report panel. */
export function ReportLoading({ label = "Loading report…" }) {
  return (
    <div className="admin-empty">
      <div className="loading-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

/** Empty state for a report panel. */
export function ReportEmpty({ title = "No data yet", message, icon: Icon = Inbox }) {
  return (
    <div className="admin-empty">
      <Icon size={28} aria-hidden="true" />
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
    </div>
  );
}

/** Last-refreshed stamp, e.g. "Updated just now". */
export function ReportUpdated({ timestamp, loading }) {
  if (!timestamp) return null;

  return (
    <span className="report-updated">
      {loading ? "Refreshing…" : `Updated ${new Date(timestamp).toLocaleTimeString()}`}
    </span>
  );
}
