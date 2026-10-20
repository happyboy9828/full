"use client";

import { useMemo, useState } from "react";
import {
  Download,
  HelpCircle,
  Laptop,
  MonitorSmartphone,
  RefreshCw,
  Smartphone,
  Tablet,
} from "lucide-react";

import AdminShell from "@/components/AdminShell/AdminShell";
import { PERMISSIONS } from "@/components/AuthProvider/AuthProvider";
import BarList from "@/components/AdminReports/BarList";
import ReportToolbar from "@/components/AdminReports/ReportToolbar";
import ReportStatGrid from "@/components/AdminReports/ReportStatGrid";
import { ReportEmpty, ReportError, ReportLoading, ReportUpdated } from "@/components/AdminReports/ReportStates";
import { reportsApi } from "@/lib/adminApi";
import { useReportQuery } from "@/lib/useReportQuery";
import { buildReportParams, defaultRange, describeRange } from "@/lib/reportParams";
import { formatNumber } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";

import "@/components/AdminReports/AdminReports.css";

const DEVICE_ICONS = {
  mobile: Smartphone,
  desktop: Laptop,
  tablet: Tablet,
  unknown: HelpCircle,
};

const CSV_COLUMNS = [
  { key: "kind", label: "Kind" },
  { key: "name", label: "Name" },
  { key: "count", label: "Sessions" },
  { key: "percentage", label: "Share (%)" },
];

function DeviceIcon({ type }) {
  const Icon = DEVICE_ICONS[type] || HelpCircle;
  return (
    <span className="report-device-icon" aria-hidden="true">
      <Icon size={15} />
    </span>
  );
}

/**
 * Devices report — how the sessions were split across device types,
 * browsers and operating systems.
 */
export default function DevicesModule() {
  const [range, setRange] = useState(() => defaultRange(30));
  const [domain, setDomain] = useState("");

  const params = useMemo(
    () => buildReportParams({ ...range, domain }),
    [range, domain]
  );

  const { data, error, loading, refetch, updatedAt } = useReportQuery(
    reportsApi.devices,
    params
  );

  const deviceTypes = useMemo(() => data?.data?.deviceTypes || [], [data]);
  const browsers = useMemo(() => data?.data?.browsers || [], [data]);
  const operatingSystems = useMemo(() => data?.data?.operatingSystems || [], [data]);

  const totalSessions = deviceTypes.reduce((sum, row) => sum + (Number(row.count) || 0), 0);
  const topDevice = deviceTypes[0];
  const topBrowser = browsers[0];
  const topOs = operatingSystems[0];

  const csvRows = [
    ...deviceTypes.map((row) => ({ kind: "Device type", name: row.type, count: row.count, percentage: row.percentage })),
    ...browsers.map((row) => ({ kind: "Browser", name: row.browser, count: row.count, percentage: row.percentage })),
    ...operatingSystems.map((row) => ({ kind: "Operating system", name: row.os, count: row.count, percentage: row.percentage })),
  ];

  const hasData = deviceTypes.length > 0 || browsers.length > 0 || operatingSystems.length > 0;

  return (
    <AdminShell
      title="Devices"
      subtitle={`Device, browser and operating-system split for ${describeRange(range)}`}
      requirePermission={PERMISSIONS.ANALYTICS_VIEW}
      actions={
        <>
          <ReportUpdated timestamp={updatedAt} loading={loading} />
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--sm"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--sm"
            onClick={() => downloadCsv("docstools-devices", CSV_COLUMNS, csvRows)}
            disabled={!csvRows.length}
          >
            <Download size={14} aria-hidden="true" />
            CSV
          </button>
        </>
      }
    >
      <ReportStatGrid
        items={[
          { label: "Sessions analysed", value: formatNumber(totalSessions) },
          {
            label: "Top device",
            value: topDevice ? topDevice.type : "—",
            meta: topDevice ? `${topDevice.percentage}% of sessions` : undefined,
          },
          {
            label: "Top browser",
            value: topBrowser ? topBrowser.browser : "—",
            meta: topBrowser ? `${topBrowser.percentage}% of sessions` : undefined,
          },
          {
            label: "Top OS",
            value: topOs ? topOs.os : "—",
            meta: topOs ? `${topOs.percentage}% of sessions` : undefined,
          },
        ]}
      />

      <section className="admin-panel">
        <div className="admin-panel-header">
          <ReportToolbar
            range={range}
            onRangeChange={setRange}
            domain={domain}
            onDomainChange={setDomain}
          />
        </div>

        <ReportError error={error} onRetry={refetch} />

        <div className="admin-panel-body admin-panel-body--flush">
          {loading && !hasData ? (
            <ReportLoading label="Loading device data…" />
          ) : !hasData ? (
            <ReportEmpty
              title="No device data yet"
              message="Device, browser and operating-system details appear here once sessions carry a user agent."
              icon={MonitorSmartphone}
            />
          ) : (
            <div className="report-split" style={{ padding: "24px" }}>
              <section className="admin-panel">
                <div className="admin-panel-header">
                  <div className="admin-panel-title">Device types</div>
                  <div className="admin-panel-subtitle">Share of sessions</div>
                </div>
                <div className="admin-panel-body">
                  <BarList
                    items={deviceTypes.map((row) => ({
                      label: row.type,
                      value: formatNumber(row.count),
                      percentage: row.percentage,
                    }))}
                  />
                </div>
              </section>

              <section className="admin-panel">
                <div className="admin-panel-header">
                  <div className="admin-panel-title">Browsers</div>
                  <div className="admin-panel-subtitle">Share of sessions</div>
                </div>
                <div className="admin-panel-body">
                  <BarList
                    tone="secondary"
                    items={browsers.map((row) => ({
                      label: row.browser,
                      value: formatNumber(row.count),
                      percentage: row.percentage,
                    }))}
                  />
                </div>
              </section>
            </div>
          )}
        </div>
      </section>

      <div className="report-split">
        <section className="admin-panel">
          <div className="admin-panel-header">
            <div className="admin-panel-title">Device types</div>
            <div className="admin-panel-subtitle">{deviceTypes.length} categories</div>
          </div>
          <div className="admin-panel-body admin-panel-body--flush">
            {deviceTypes.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Device</th>
                      <th className="numeric">Sessions</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviceTypes.map((row) => (
                      <tr key={row.type}>
                        <td>
                          <div className="admin-cell-primary" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <DeviceIcon type={row.type} />
                            <strong>{row.type}</strong>
                          </div>
                        </td>
                        <td className="numeric">{formatNumber(row.count)}</td>
                        <td>
                          <div className="report-share">
                            <div className="report-share-track">
                              <div className="report-share-fill" style={{ width: `${Math.min(row.percentage || 0, 100)}%` }} />
                            </div>
                            <span className="report-share-value">{row.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty">
                <p>No device types recorded.</p>
              </div>
            )}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <div className="admin-panel-title">Browsers &amp; operating systems</div>
            <div className="admin-panel-subtitle">Most used in this period</div>
          </div>
          <div className="admin-panel-body admin-panel-body--flush">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Kind</th>
                    <th className="numeric">Sessions</th>
                    <th className="numeric">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {browsers.map((row) => (
                    <tr key={`browser-${row.browser}`}>
                      <td>
                        <div className="admin-cell-primary">
                          <strong>{row.browser}</strong>
                        </div>
                      </td>
                      <td className="admin-cell-muted">Browser</td>
                      <td className="numeric">{formatNumber(row.count)}</td>
                      <td className="numeric">{row.percentage}%</td>
                    </tr>
                  ))}
                  {operatingSystems.map((row) => (
                    <tr key={`os-${row.os}`}>
                      <td>
                        <div className="admin-cell-primary">
                          <strong>{row.os}</strong>
                        </div>
                      </td>
                      <td className="admin-cell-muted">Operating system</td>
                      <td className="numeric">{formatNumber(row.count)}</td>
                      <td className="numeric">{row.percentage}%</td>
                    </tr>
                  ))}
                  {!browsers.length && !operatingSystems.length ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="admin-empty">
                          <p>No browser or operating-system data.</p>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
