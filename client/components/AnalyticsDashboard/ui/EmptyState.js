"use client";

export default function EmptyState({ title = "No data", description = "There are no records for the selected period." }) {
  return (
    <div className="tool-card" style={{ textAlign: "center", padding: "36px 24px" }}>
      <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 12, opacity: 0.4 }}>○</div>
      <p style={{ margin: 0, fontWeight: 600 }}>{title}</p>
      <p className="tool-muted" style={{ margin: "6px 0 0", fontSize: 13 }}>
        {description}
      </p>
    </div>
  );
}
