"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchReport } from "@/lib/analyticsApi";
import DataTable from "../ui/DataTable";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import CsvExportButton from "../ui/CsvExportButton";

export default function ReturningVisitorsView({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const r = await fetchReport("returning-visitors", params);
        if (!cancelled) {
          if (r.status === 200 && r.json?.success) {
            setData(r.json.data);
          } else {
            setError(r.json?.error || "Failed to load returning visitors");
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
  }, [params.startDate, params.endDate]);

  const csvRows = useMemo(() => {
    if (!data) return [];
    return data.map((v) => ({
      "Visitor ID": v.visitorId.substring(0, 8) + "…",
      "Visits": v.visitCount,
      "First Visit": v.firstVisit ? new Date(v.firstVisit).toLocaleDateString() : "",
      "Last Visit": v.lastVisit ? new Date(v.lastVisit).toLocaleDateString() : "",
      "Device": v.deviceType || "",
      "Browser": v.browser || "",
      "OS": v.os || "",
      "Country": v.country || "",
      "Referrer": v.referrerDomain || "",
      "UTM Source": v.utmSource || "",
    }));
  }, [data]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data || !data.length) return <EmptyState message="No returning visitors in selected period" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--tool-gap)" }}>
      <div className="tool-card" style={{ overflow: "hidden" }}>
        <div className="tool-row" style={{ padding: "var(--tool-card-pad)", borderBottom: "1px solid var(--tool-border)" }}>
          <div>
            <p className="tool-card-title" style={{ margin: 0 }}>Returning Visitors</p>
            <p className="tool-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
              {data.length} visitors with 2+ visits in selected period
            </p>
          </div>
          <CsvExportButton filename={`returning-visitors-${params.startDate || "custom"}-to-${params.endDate || "custom"}.csv`} rows={csvRows} />
        </div>
        <DataTable
          columns={[
            { key: "visitorId", header: "Visitor ID", width: 120 },
            { key: "visitCount", header: "Visits", align: "right", width: 80 },
            { key: "firstVisit", header: "First Visit", width: 140, render: (row) => row.firstVisit ? new Date(row.firstVisit).toLocaleDateString() : "-" },
            { key: "lastVisit", header: "Last Visit", width: 140, render: (row) => row.lastVisit ? new Date(row.lastVisit).toLocaleDateString() : "-" },
            { key: "deviceType", header: "Device", width: 100 },
            { key: "browser", header: "Browser", width: 120 },
            { key: "os", header: "OS", width: 100 },
            { key: "country", header: "Country", width: 100 },
            { key: "referrerDomain", header: "Referrer", width: 150 },
            { key: "utmSource", header: "UTM Source", width: 120 },
          ]}
          rows={data.map((v) => ({
            visitorId: v.visitorId.substring(0, 8) + "…",
            visitCount: v.visitCount,
            firstVisit: v.firstVisit,
            lastVisit: v.lastVisit,
            deviceType: v.deviceType || "-",
            browser: v.browser || "-",
            os: v.os || "-",
            country: v.country || "-",
            referrerDomain: v.referrerDomain || "-",
            utmSource: v.utmSource || "-",
          }))}
        />
      </div>
    </div>
  );
}