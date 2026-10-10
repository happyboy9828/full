"use client";

export default function LoadingState({ message = "Loading…" }) {
  return (
    <div className="tool-card" style={{ textAlign: "center", padding: "36px 24px" }}>
      <div
        className="tool-mono"
        style={{
          display: "inline-block",
          width: 32,
          height: 32,
          border: "3px solid var(--tool-border)",
          borderTopColor: "var(--tool-accent)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p className="tool-muted" style={{ margin: "14px 0 0", fontSize: 13 }}>
        {message}
      </p>
    </div>
  );
}
