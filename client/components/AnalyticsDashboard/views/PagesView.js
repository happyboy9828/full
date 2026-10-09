"use client";

import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import DataTable from "../ui/DataTable";
import CsvExportButton from "../ui/CsvExportButton";
import useReport from "@/lib/useReport";

const COLUMNS = [
  { key: "path", label: "Page" },
  { key: "title", label: "Title" },
  { key: "pageViews", label: "Page Views", align: "right" },
  { key: "uniqueVisitors", label: "Unique Visitors", align: "right" },
  {
    key: "avgTime",
    label: "Avg. Time",
    align: "right",
    render: (v) => `${Number(v || 0).toFixed(0)}s`,
  },
];

export default function PagesView({ params }) {
  const report = useReport("pages", params);

  if (report.loading) return <LoadingState message="Loading top pages…" />;
  if (report.error) return <ErrorState error={report.error} onRetry={report.refetch} />;

  const rows = report.data || [];

  return (
    <div>
      {rows.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <CsvExportButton data={rows} filename="top-pages" columns={[...COLUMNS.map((c) => c.key)]} />
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState title="No page data" description="No pageviews recorded for the selected period." />
      ) : (
        <DataTable columns={COLUMNS} rows={rows} pageSize={15} />
      )}
    </div>
  );
}
