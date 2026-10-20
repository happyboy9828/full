"use client";

import "./AdminReports.css";

/**
 * Row of headline metrics for a report panel.
 *
 * @param {{label: string, value: string, meta?: string}[]} items
 */
export default function ReportStatGrid({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="report-stat-strip">
      {items.map((item) => (
        <div key={item.label} className="report-stat">
          <span className="report-stat-label">{item.label}</span>
          <div className="report-stat-value">{item.value}</div>
          {item.meta ? <span className="report-stat-meta">{item.meta}</span> : null}
        </div>
      ))}
    </div>
  );
}
