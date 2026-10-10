"use client";

import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import DataTable from "../ui/DataTable";
import CsvExportButton from "../ui/CsvExportButton";
import useReport from "@/lib/useReport";

const COLUMNS = [
  {
    key: "type",
    label: "Type",
    render: (v, row) => (row.eventType ? row.eventType : row.customName ? "Custom" : v),
  },
  { key: "count", label: "Count", align: "right" },
];

export default function EventsView({ params }) {
  const report = useReport("events", params);

  if (report.loading) return <LoadingState message="Loading events…" />;
  if (report.error) return <ErrorState error={report.error} onRetry={report.refetch} />;

  const rows = report.data || [];

  return (
    <div>
      {rows.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <CsvExportButton data={rows} filename="events" columns={["eventType", "customName", "count"]} />
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState title="No events" description="No tracked events recorded for the selected period." />
      ) : (
        <DataTable columns={COLUMNS} rows={rows} pageSize={15} />
      )}
    </div>
  );
}
