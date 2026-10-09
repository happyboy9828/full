"use client";

export default function CsvExportButton({ data, filename = "export", columns, label = "Export CSV" }) {
  if (!data || data.length === 0) return null;

  const handleExport = () => {
    const csv = convertToCsv(data, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button type="button" className="tool-btn tool-btn-ghost tool-btn-small" onClick={handleExport}>
      {label}
    </button>
  );
}

function convertToCsv(data, columns) {
  const cols = columns || Object.keys(data[0] || {});
  const header = cols.join(",");
  const rows = data.map((row) =>
    cols
      .map((key) => csvCell(row[key]))
      .join(",")
  );
  return [header, ...rows].join("\r\n");
}

function csvCell(value) {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
