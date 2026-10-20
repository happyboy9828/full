"use client";

import "./AdminReports.css";

/**
 * Horizontal bar list used for ranked distributions (traffic sources, device
 * types, browsers, event types).
 *
 * @param {{label: string, value: string, percentage: number, meta?: string}[]} items
 * @param {"accent" | "secondary" | "highlight"} tone
 */
export default function BarList({ items = [], tone = "accent" }) {
  if (!items.length) {
    return (
      <div className="admin-empty">
        <p>No data for this period.</p>
      </div>
    );
  }

  const max = Math.max(...items.map((item) => Number(item.percentage) || 0), 1);

  return (
    <div className="report-bars">
      {items.map((item) => {
        const percentage = Number(item.percentage) || 0;
        const width = Math.max((percentage / max) * 100, percentage > 0 ? 2 : 0);

        return (
          <div key={item.label} className="report-bar">
            <div className="report-bar-head">
              <span className="report-bar-label" title={item.label}>
                {item.label}
              </span>
              <span className="report-bar-meta">
                {item.value}
                {item.meta ? ` · ${item.meta}` : ""}
              </span>
            </div>
            <div
              className="report-bar-track"
              role="meter"
              aria-label={item.label}
              aria-valuenow={Math.round(percentage)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`report-bar-fill report-bar-fill--${tone}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
