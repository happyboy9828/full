"use client";

import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import DataTable from "../ui/DataTable";
import CsvExportButton from "../ui/CsvExportButton";
import useReport from "@/lib/useReport";

const COLS_DEVICE = [
  { key: "type", label: "Device" },
  { key: "count", label: "Sessions", align: "right" },
  {
    key: "percentage",
    label: "%",
    align: "right",
    render: (v) => `${Number(v).toFixed(1)}%`,
  },
];

const COLS_BROWSER = [
  { key: "browser", label: "Browser" },
  { key: "count", label: "Sessions", align: "right" },
  {
    key: "percentage",
    label: "%",
    align: "right",
    render: (v) => `${Number(v).toFixed(1)}%`,
  },
];

const COLS_OS = [
  { key: "os", label: "Operating System" },
  { key: "count", label: "Sessions", align: "right" },
  {
    key: "percentage",
    label: "%",
    align: "right",
    render: (v) => `${Number(v).toFixed(1)}%`,
  },
];

function SubTable({ title, columns, rows }) {
  return (
    <div className="tool-card">
      <p className="tool-card-title">{title}</p>
      {rows.length === 0 ? (
        <EmptyState title="No data" description={`No ${title.toLowerCase()} data recorded.`} />
      ) : (
        <>
          {rows.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <CsvExportButton
                data={rows}
                filename={`devices-${title.toLowerCase()}`}
                columns={columns.map((c) => c.key)}
              />
            </div>
          )}
          <DataTable columns={columns} rows={rows} pageSize={10} />
        </>
      )}
    </div>
  );
}

export default function DevicesView({ params }) {
  const report = useReport("devices", params);

  if (report.loading) return <LoadingState message="Loading device breakdown…" />;
  if (report.error) return <ErrorState error={report.error} onRetry={report.refetch} />;

  const data = report.data || {};
  const hasData =
    (data.deviceTypes || []).length > 0 ||
    (data.browsers || []).length > 0 ||
    (data.operatingSystems || []).length > 0;

  if (!hasData) {
    return (
      <EmptyState title="No device data" description="No device information recorded for the selected period." />
    );
  }

  return (
    <div className="tool-col" style={{ gap: "var(--tool-col-gap)" }}>
      <SubTable title="Device Types" columns={COLS_DEVICE} rows={data.deviceTypes || []} />
      <SubTable title="Browsers" columns={COLS_BROWSER} rows={data.browsers || []} />
      <SubTable title="Operating Systems" columns={COLS_OS} rows={data.operatingSystems || []} />
    </div>
  );
}
