"use client";

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="tool-card" style={{ textAlign: "center", padding: "32px 24px" }}>
      <p style={{ margin: 0, fontWeight: 600, color: "var(--tool-accent-text)" }}>
        Something went wrong
      </p>
      <p className="tool-muted" style={{ margin: "8px 0 16px", fontSize: 13 }}>
        {typeof error === "string" ? error : "Unable to load this report. Please try again."}
      </p>
      {onRetry ? (
        <button type="button" className="tool-btn tool-btn-ghost tool-btn-small" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}
