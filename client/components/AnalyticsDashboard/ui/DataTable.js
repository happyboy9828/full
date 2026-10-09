"use client";

import { useState } from "react";

export default function DataTable({ columns, rows, pageSize = 10, emptyMessage = "No data to display" }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIdx = (safePage - 1) * pageSize;
  const pageRows = rows.slice(startIdx, startIdx + pageSize);

  if (rows.length === 0) {
    return <EmptyMessage message={emptyMessage} />;
  }

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table className="tool-datatable">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={col.align === "right" ? { textAlign: "right" } : undefined}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={row._id || row.id || `${startIdx + i}`}>
                {columns.map((col) => (
                  <td key={col.key} style={col.align === "right" ? { textAlign: "right" } : undefined}>
                    {col.render ? col.render(row[col.key], row) : formatCellValue(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="tool-row"
          style={{
            padding: "12px 0",
            borderTop: "1px solid var(--tool-border)",
            justifyContent: "space-between",
            fontSize: 13,
          }}
        >
          <span className="tool-muted">
            {startIdx + 1}–{Math.min(startIdx + pageSize, rows.length)} of {rows.length}
          </span>
          <div className="tool-actions" style={{ maxWidth: "280px", flex: "auto" }}>
            <button
              type="button"
              className="tool-btn tool-btn-ghost tool-btn-small"
              disabled={safePage === 1}
              onClick={() => setPage(1)}
            >
              First
            </button>
            <button
              type="button"
              className="tool-btn tool-btn-ghost tool-btn-small"
              disabled={safePage === 1}
              onClick={() => setPage(Math.max(1, safePage - 1))}
            >
              Prev
            </button>
            <span className="tool-muted" style={{ padding: "0 8px" }}>
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              className="tool-btn tool-btn-ghost tool-btn-small"
              disabled={safePage === totalPages}
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
            >
              Next
            </button>
            <button
              type="button"
              className="tool-btn tool-btn-ghost tool-btn-small"
              disabled={safePage === totalPages}
              onClick={() => setPage(totalPages)}
            >
              Last
            </button>
          </div>
        </div>
      )}

      <style>{`
        .tool-datatable { width: 100%; border-collapse: collapse; font-size: 13px; }
        .tool-datatable th, .tool-datatable td { padding: 8px 10px; text-align: left; border-bottom: 1px solid var(--tool-border); }
        .tool-datatable th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--tool-muted); }
        .tool-datatable tr:hover td { background: var(--tool-tint); }
      `}</style>
    </div>
  );
}

function EmptyMessage({ message }) {
  return <div className="tool-empty">{message}</div>;
}

function formatCellValue(value) {
  if (value == null) return "—";
  if (typeof value === "number") {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
    if (value >= 1000) return (value / 1000).toFixed(1) + "K";
    return value.toLocaleString();
  }
  return String(value);
}
