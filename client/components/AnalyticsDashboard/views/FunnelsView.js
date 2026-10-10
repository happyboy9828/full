"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchReport } from "@/lib/analyticsApi";
import DataTable from "../ui/DataTable";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import CsvExportButton from "../ui/CsvExportButton";

export default function FunnelsView({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState("/,/tools,/BGRemove");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const r = await fetchReport("funnel", { ...params, steps });
        if (!cancelled) {
          if (r.status === 200 && r.json?.success) {
            setData(r.json.data);
          } else {
            setError(r.json?.error || "Failed to load funnel");
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
  }, [params.startDate, params.endDate, steps]);

  const csvRows = useMemo(() => {
    if (!data) return [];
    return data.steps.map((s) => ({
      Step: s.step,
      Path: s.path,
      Visitors: s.visitors,
      "Drop-off %": s.step === 1 ? "-" : data.steps[s.step - 2].visitors > 0
        ? (((data.steps[s.step - 2].visitors - s.visitors) / data.steps[s.step - 2].visitors) * 100).toFixed(1)
        : "-",
    }));
  }, [data]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data || !data.steps?.length) return <EmptyState message="No funnel data for selected period" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--tool-gap)" }}>
      <div className="tool-card">
        <p className="tool-card-title" style={{ margin: "0 0 10px" }}>Funnel Steps (comma-separated paths)</p>
        <input
          type="text"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          className="tool-input"
          placeholder="/, /tools, /BGRemove"
          style={{ maxWidth: 500 }}
        />
        <p className="tool-muted" style={{ margin: "8px 0 0", fontSize: 12 }}>
          Define 2-10 steps. Example: <code>/,/tools,/BGRemove</code>
        </p>
      </div>

      <div className="tool-card" style={{ overflow: "hidden" }}>
        <div className="tool-row" style={{ padding: "var(--tool-card-pad)", borderBottom: "1px solid var(--tool-border)" }}>
          <div>
            <p className="tool-card-title" style={{ margin: 0 }}>Funnel Conversion</p>
            <p className="tool-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
              Overall conversion rate: <strong>{data.conversionRate}%</strong> ({data.steps[data.steps.length - 1]?.visitors || 0} of {data.steps[0]?.visitors || 0} from step 1)
            </p>
          </div>
          <CsvExportButton filename={`funnel-${params.startDate || "custom"}-to-${params.endDate || "custom"}.csv`} rows={csvRows} />
        </div>
        <DataTable
          columns={[
            { key: "step", header: "Step", width: 60 },
            { key: "path", header: "Path" },
            { key: "visitors", header: "Visitors", align: "right" },
            { key: "dropoff", header: "Drop-off %", align: "right" },
          ]}
          rows={data.steps.map((s, i) => ({
            step: s.step,
            path: s.path,
            visitors: s.visitors,
            dropoff: i === 0 ? "-" : data.steps[i - 1].visitors > 0
              ? (((data.steps[i - 1].visitors - s.visitors) / data.steps[i - 1].visitors) * 100).toFixed(1) + "%"
              : "-",
          }))}
        />
      </div>
    </div>
  );
}