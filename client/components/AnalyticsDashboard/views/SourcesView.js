"use client";

import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import DataTable from "../ui/DataTable";
import CsvExportButton from "../ui/CsvExportButton";
import useReport from "@/lib/useReport";

const COLUMNS = [
  { key: "source", label: "Source" },
  { key: "visits", label: "Visits", align: "right" },
  {
    key: "percentage",
    label: "% of Traffic",
    align: "right",
    render: (v) => `${Number(v).toFixed(1)}%`,
  },
];

export default function SourcesView({ params }) {
  const report = useReport("sources", params);

  if (report.loading) return <LoadingState message="Loading traffic sources…" />;
  if (report.error) return <ErrorState error={report.error} onRetry={report.refetch} />;

  const rows = report.data || [];

  return (
    <div>
      {rows.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <CsvExportButton data={rows} filename="traffic-sources" columns={COLUMNS.map((c) => c.key)} />
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState title="No traffic data" description="No sources recorded for the selected period." />
      ) : (
        <DataTable columns={COLUMNS} rows={rows} pageSize={15} />
      )}
    </div>
  );
}
