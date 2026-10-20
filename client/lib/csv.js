"use client";

/**
 * Minimal CSV export helper for the admin tables.
 *
 * Values are quoted and internal quotes doubled so a comma or a line break
 * inside a value cannot break the file.
 */
function escapeCell(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Builds a CSV string.
 *
 * @param {Array<{key: string, label: string}>} columns
 * @param {Array<object>} rows
 */
export function toCsv(columns, rows) {
  const header = columns.map((column) => escapeCell(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCell(row[column.key])).join(",")
  );
  return [header, ...body].join("\r\n");
}

/**
 * Triggers a browser download of the CSV.
 *
 * @param {string} filename
 * @param {Array<{key: string, label: string}>} columns
 * @param {Array<object>} rows
 */
export function downloadCsv(filename, columns, rows) {
  const csv = toCsv(columns, rows);
  // The BOM makes Excel open the file as UTF-8 instead of the local codepage.
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default downloadCsv;
