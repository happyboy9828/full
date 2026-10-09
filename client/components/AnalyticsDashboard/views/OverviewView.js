"use client";

import { useMemo } from "react";
import StatCard from "../ui/StatCard";
import TimeSeriesChart from "../ui/TimeSeriesChart";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import CsvExportButton from "../ui/CsvExportButton";
import useReport, { useIntervalReport } from "@/lib/useReport";

export default function OverviewView({ params }) {
  const overview = useReport("overview", params);
  const timeSeries = useIntervalReport(
    "time-series",
    { ...params, granularity: "day" },
    60000
  );

  const loading = overview.loading && timeSeries.loading;
  const error = overview.error || timeSeries.error;

  const statCols = useMemo(
    () => [
      { label: "Page Views", value: overview.data?.pageViews ?? 0 },
      { label: "Unique Visitors", value: overview.data?.uniqueVisitors ?? 0 },
      { label: "Sessions", value: overview.data?.sessions ?? 0 },
      { label: "Total Events", value: overview.data?.totalEvents ?? 0 },
    ],
    [overview.data]
  );

  const statCols2 = useMemo(
    () => [
      {
        label: "Bounce Rate",
        value: overview.data?.bounceRate,
        unit: "%",
      },
      {
        label: "Avg. Session Duration",
        value: overview.data?.avgSessionDuration,
        unit: "s",
      },
      {
        label: "Pages / Session",
        value: overview.data?.avgPagesPerSession,
        unit: "",
      },
      {
        label: "Returning Visitors",
        value: overview.data?.returningVisitors ?? 0,
      },
    ],
    [overview.data]
  );

  if (loading) return <LoadingState message="Loading overview…" />;
  if (error)
    return <ErrorState error={error} onRetry={() => {
      overview.refetch();
      timeSeries.refetch();
    }} />;

  const hasData = overview.data && (overview.data.pageViews > 0 || overview.data.totalEvents > 0);

  if (!hasData) {
    return (
      <div>
        <EmptyState title="No analytics data yet" description="Tracking events will appear here once your site receives visitors." />
        {!timeSeries.loading && timeSeries.data && (
          <CsvExportButton data={timeSeries.data} filename="time-series" columns={tsColumns} />
        )}
      </div>
    );
  }

  const csvRows = [
    { metric: "Page Views", value: overview.data?.pageViews || 0 },
    { metric: "Unique Visitors", value: overview.data?.uniqueVisitors || 0 },
    { metric: "Sessions", value: overview.data?.sessions || 0 },
    { metric: "Bounce Rate", value: `${overview.data?.bounceRate || 0}%` },
    { metric: "Avg. Session Duration", value: `${overview.data?.avgSessionDuration || 0}s` },
    { metric: "Pages / Session", value: overview.data?.avgPagesPerSession || 0 },
    { metric: "Returning Visitors", value: overview.data?.returningVisitors || 0 },
    { metric: "New Visitors", value: overview.data?.newVisitors || 0 },
    { metric: "Total Events", value: overview.data?.totalEvents || 0 },
  ];

  return (
    <div className="tool-col" style={{ gap: "var(--tool-gap)" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <CsvExportButton data={csvRows} filename="overview-metrics" columns={["metric", "value"]} />
      </div>

      <div
        className="tool-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {statCols.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} unit={s.unit} loading={false} />
        ))}
      </div>

      <div
        className="tool-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {statCols2.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} unit={s.unit} loading={false} />
        ))}
      </div>

      {!timeSeries.loading && timeSeries.data && timeSeries.data.length > 0 ? (
        <div className="tool-card">
          <p className="tool-card-title">Page Views Over Time</p>
          <TimeSeriesChart data={timeSeries.data} />
        </div>
      ) : null}
    </div>
  );
}

const tsColumns = [
  { key: "date", label: "Date" },
  { key: "pageViews", label: "Page Views" },
  { key: "sessions", label: "Sessions" },
  { key: "visitors", label: "Visitors" },
  { key: "events", label: "Events" },
];
