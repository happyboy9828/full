"use client";

import { useMemo, useState } from "react";
import { ChartNoAxesCombined, Download, RefreshCw } from "lucide-react";

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

const CSV_COLUMNS = [
  { key: "source", label: "Source" },
  { key: "visits", label: "Visits" },
  { key: "percentage", label: "Share (%)" },
];

/**
 * Traffic sources report — where sessions came from.
 *
 * Sessions without a referrer or a UTM source are reported as `direct`.
 */
export default function TrafficSourcesModule() {
  const [range, setRange] = useState(() => defaultRange(30));
  const [domain, setDomain] = useState("");

  const params = useMemo(
    () => buildReportParams({ ...range, domain }),
    [range, domain]
  );

  const { data, error, loading, refetch, updatedAt } = useReportQuery(
    reportsApi.sources,
    params
  );

  const rows = useMemo(() => {
    const list = Array.isArray(data?.data) ? data.data : [];
    return [...list].sort((a, b) => (Number(b.visits) || 0) - (Number(a.visits) || 0));
  }, [data]);

  const totalVisits = rows.reduce((sum, row) => sum + (Number(row.visits) || 0), 0);
  const top = rows[0];
  const direct = rows.find((row) => row.source === "direct");
  const referred = totalVisits - (Number(direct?.visits) || 0);

  return (
    <AdminShell
      title="Traffic Sources"
      subtitle={`Where the sessions came from during ${describeRange(range)}`}
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
            onClick={() => downloadCsv("docstools-traffic-sources", CSV_COLUMNS, rows)}
            disabled={!rows.length}
          >
            <Download size={14} aria-hidden="true" />
            CSV
          </button>
        </>
      }
    >
      <ReportStatGrid
        items={[
          { label: "Total sessions", value: formatNumber(totalVisits) },
          { label: "Distinct sources", value: formatNumber(rows.length) },
          { label: "Top source", value: top ? top.source : "—", meta: top ? `${top.percentage}% of sessions` : undefined },
          { label: "Referred sessions", value: formatNumber(referred), meta: direct ? `${direct.percentage}% direct` : undefined },
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
          {loading && !rows.length ? (
            <ReportLoading label="Loading traffic sources…" />
          ) : !rows.length ? (
            <ReportEmpty
              title="No traffic sources yet"
              message="Sessions appear here as soon as visitors arrive from a referrer, a campaign link or directly."
              icon={ChartNoAxesCombined}
            />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Source</th>
                    <th className="numeric">Visits</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.source || index}>
                      <td>
                        <span className={`report-rank ${index < 3 ? "report-rank--top" : ""}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td>
                        <div className="admin-cell-primary">
                          <strong>{row.source}</strong>
                        </div>
                      </td>
                      <td className="numeric">{formatNumber(row.visits)}</td>
                      <td>
                        <div className="report-share">
                          <div className="report-share-track">
                            <div
                              className="report-share-fill"
                              style={{ width: `${Math.min(row.percentage || 0, 100)}%` }}
                            />
                          </div>
                          <span className="report-share-value">{row.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title">Distribution</div>
          <div className="admin-panel-subtitle">Share of sessions per source</div>
        </div>
        <div className="admin-panel-body">
          <BarList
            items={rows.slice(0, 12).map((row) => ({
              label: row.source,
              value: formatNumber(row.visits),
              percentage: row.percentage,
            }))}
          />
        </div>
      </section>
    </AdminShell>
  );
}
