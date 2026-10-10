"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchReport } from "@/lib/analyticsApi";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import CsvExportButton from "../ui/CsvExportButton";

export default function RetentionView({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [granularity, setGranularity] = useState("day");
  const [maxPeriods, setMaxPeriods] = useState(12);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const r = await fetchReport("retention", { ...params, granularity, maxPeriods });
        if (!cancelled) {
          if (r.status === 200 && r.json?.success) {
            setData(r.json.data);
          } else {
            setError(r.json?.error || "Failed to load retention");
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
  }, [params.startDate, params.endDate, granularity, maxPeriods]);

  const csvRows = useMemo(() => {
    if (!data) return [];
    const rows = [];
    for (const cohort of data) {
      for (const r of cohort.retention) {
        if (r !== null) {
          rows.push({
            Cohort: cohort.cohort,
            "Cohort Size": cohort.size,
            Period: r.period,
            Retained: r.retained,
            "Rate %": r.rate,
          });
        }
      }
    }
    return rows;
  }, [data]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data || !data.length) return <EmptyState message="No retention data for selected period" />;

  const periodLabels = data[0]?.retention
    ?.filter((r) => r !== null)
    ?.map((r) => `${granularity === "week" ? "Week" : "Day"} ${r.period}`) || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--tool-gap)" }}>
      <div className="tool-card">
        <p className="tool-card-title" style={{ margin: "0 0 10px" }}>Retention Settings</p>
        <div className="tool-row" style={{ gap: "var(--tool-gap)", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label className="tool-label" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Granularity</label>
            <select value={granularity} onChange={(e) => setGranularity(e.target.value)} className="tool-input" style={{ width: 140 }}>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
            </select>
          </div>
          <div>
            <label className="tool-label" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Max Periods</label>
            <input
              type="number"
              value={maxPeriods}
              onChange={(e) => setMaxPeriods(Math.max(1, Math.min(52, Number(e.target.value))))}
              className="tool-input"
              style={{ width: 100 }}
              min={1}
              max={52}
            />
          </div>
        </div>
      </div>

      <div className="tool-card" style={{ overflow: "hidden" }}>
        <div className="tool-row" style={{ padding: "var(--tool-card-pad)", borderBottom: "1px solid var(--tool-border)", flexWrap: "wrap", gap: "var(--tool-gap)" }}>
          <div>
            <p className="tool-card-title" style={{ margin: 0 }}>Retention Matrix</p>
            <p className="tool-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
              {data.length} cohorts | {data[0]?.retention?.filter((r) => r !== null).length || 0} periods shown
            </p>
          </div>
          <CsvExportButton filename={`retention-${granularity}-${params.startDate || "custom"}-to-${params.endDate || "custom"}.csv`} rows={csvRows} />
        </div>
        <div style={{ overflowX: "auto", padding: "var(--tool-card-pad)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 600 }}>
            <thead>
              <tr style={{ background: "var(--tool-surface-2)", textAlign: "left" }}>
                <th style={{ padding: "8px 10px", borderBottom: "2px solid var(--tool-border)", position: "sticky", left: 0, background: "var(--tool-surface-2)", zIndex: 1, minWidth: 120 }}>Cohort</th>
                <th style={{ padding: "8px 10px", borderBottom: "2px solid var(--tool-border)", textAlign: "right", minWidth: 80 }}>Size</th>
                {periodLabels.map((label, i) => (
                  <th key={i} style={{ padding: "8px 10px", borderBottom: "2px solid var(--tool-border)", textAlign: "center", minWidth: 70 }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((cohort, rowIndex) => (
                <tr key={cohort.cohort} style={{ background: rowIndex % 2 === 0 ? "transparent" : "var(--tool-surface-2)" }}>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--tool-border)", fontWeight: 500, position: "sticky", left: 0, background: "inherit", zIndex: 1 }}>
                    {cohort.cohort}
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--tool-border)", textAlign: "right", color: "var(--tool-muted)" }}>
                    {cohort.size}
                  </td>
                  {cohort.retention.map((r, colIndex) => (
                    <td key={colIndex} style={{ padding: "8px 10px", borderBottom: "1px solid var(--tool-border)", textAlign: "center" }}>
                      {r === null ? (
                        <span style={{ color: "var(--tool-border)" }}>—</span>
                      ) : (
                        <span style={{
                          fontWeight: 600,
                          color: r.rate >= 40 ? "var(--tool-success)" : r.rate >= 20 ? "var(--tool-warning)" : "var(--tool-text)",
                        }}>
                          {r.rate}%
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}