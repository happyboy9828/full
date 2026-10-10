"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchReport } from "@/lib/analyticsApi";
import DataTable from "../ui/DataTable";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import CsvExportButton from "../ui/CsvExportButton";

export default function HeatmapView({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [path, setPath] = useState("/");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const r = await fetchReport("heatmap", { ...params, path });
        if (!cancelled) {
          if (r.status === 200 && r.json?.success) {
            setData(r.json.data);
          } else {
            setError(r.json?.error || "Failed to load heatmap");
          }
        }
      } catch {
        if (!cancelled) setError("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params.startDate, params.endDate, path]);

  const csvRows = useMemo(() => {
    if (!data) return [];
    return data.elements.map((e) => ({
      Element: `${e.element.tagName}${e.element.id ? "#" + e.element.id : ""}${e.element.className ? "." + e.element.className.split(" ")[0] : ""}`,
      "Tag": e.element.tagName,
      "ID": e.element.id || "",
      "Class": e.element.className || "",
      "Text": e.element.text || "",
      "Href": e.element.href || "",
      Clicks: e.clicks,
      "Percentage %": e.percentage,
    }));
  }, [data]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data || !data.elements?.length) return <EmptyState message={`No click data for "${path}" in selected period`} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--tool-gap)" }}>
      <div className="tool-card">
        <p className="tool-card-title" style={{ margin: "0 0 10px" }}>Page Path</p>
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="tool-input"
          placeholder="/tools, /BGRemove, etc."
          style={{ maxWidth: 500 }}
        />
        <p className="tool-muted" style={{ margin: "8px 0 0", fontSize: 12 }}>
          Enter a page path to see click heatmap for that page
        </p>
      </div>

      <div className="tool-card" style={{ overflow: "hidden" }}>
        <div className="tool-row" style={{ padding: "var(--tool-card-pad)", borderBottom: "1px solid var(--tool-border)" }}>
          <div>
            <p className="tool-card-title" style={{ margin: 0 }}>Click Heatmap for <code>{data.path}</code></p>
            <p className="tool-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
              Total clicks: <strong>{data.totalClicks}</strong> across {data.elements.length} unique elements
            </p>
          </div>
          <CsvExportButton filename={`heatmap-${data.path.replace(/\//g, "-")}-${params.startDate || "custom"}-to-${params.endDate || "custom"}.csv`} rows={csvRows} />
        </div>
        <DataTable
          columns={[
            { key: "element", header: "Element", render: (row) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <code style={{ fontSize: 12 }}>{row.element.tagName}</code>
                <span style={{ fontSize: 11, color: "var(--tool-muted)" }}>
                  {row.element.id && `#${row.element.id}`}
                  {row.element.className && `.${row.element.className.split(" ")[0]}`}
                  {row.element.text && ` — "${row.element.text.substring(0, 40)}"`}
                  {row.element.href && ` → ${row.element.href.substring(0, 50)}`}
                </span>
              </div>
            ) },
            { key: "clicks", header: "Clicks", align: "right" },
            { key: "percentage", header: "% of Total", align: "right" },
          ]}
          rows={data.elements.map((e) => ({
            element: e,
            clicks: e.clicks,
            percentage: e.percentage + "%",
          }))}
        />
      </div>
    </div>
  );
}