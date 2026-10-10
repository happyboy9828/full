"use client";

export default function StatCard({ label, value, trend, unit, loading }) {
  const formatted = formatValue(value);
  return (
    <div className="tool-card" style={{ minWidth: 0 }}>
      <p className="tool-muted" style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      {loading ? (
        <div className="tool-mono" style={{ marginTop: 8, height: 24, width: "60%", background: "var(--tool-border)", borderRadius: 4 }} />
      ) : (
        <p style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
          {formatted}
          {unit ? <span style={{ fontSize: 14, fontWeight: 400, color: "var(--tool-muted)" }}> {unit}</span> : null}
        </p>
      )}
      {trend != null && !loading && (
        <p
          className="tool-mono"
          style={{
            marginTop: 6,
            fontSize: 12,
            color: trend >= 0 ? "#22c55e" : "#ef4444",
          }}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </p>
      )}
    </div>
  );
}

function formatValue(value) {
  if (value == null) return "—";
  if (typeof value === "number") {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
    if (value >= 1000) return (value / 1000).toFixed(1) + "K";
    return Math.round(value).toLocaleString();
  }
  return String(value);
}
