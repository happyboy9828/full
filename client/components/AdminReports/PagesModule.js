"use client";

import { useMemo, useState } from "react";
import { Download, FileText, RefreshCw, Search } from "lucide-react";

import AdminShell from "@/components/AdminShell/AdminShell";
import { PERMISSIONS } from "@/components/AuthProvider/AuthProvider";
import ReportToolbar from "@/components/AdminReports/ReportToolbar";
import ReportStatGrid from "@/components/AdminReports/ReportStatGrid";
import { ReportEmpty, ReportError, ReportLoading, ReportUpdated } from "@/components/AdminReports/ReportStates";
import { reportsApi } from "@/lib/adminApi";
import { useReportQuery } from "@/lib/useReportQuery";
import { buildReportParams, defaultRange, describeRange } from "@/lib/reportParams";
import { formatDuration, formatNumber } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";

import "@/components/AdminReports/AdminReports.css";

const PAGE_SIZE = 25;

const SORTS = [
  { key: "pageViews", label: "Page views" },
  { key: "uniqueVisitors", label: "Visitors" },
  { key: "avgTime", label: "Avg time" },
  { key: "path", label: "Path" },
];

const CSV_COLUMNS = [
  { key: "path", label: "Path" },
  { key: "title", label: "Title" },
  { key: "pageViews", label: "Page views" },
  { key: "uniqueVisitors", label: "Unique visitors" },
  { key: "avgTime", label: "Avg time (s)" },
];

/**
 * Pages report — every page that received a pageview in the selected window.
 */
export default function PagesModule() {
  const [range, setRange] = useState(() => defaultRange(30));
  const [domain, setDomain] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("pageViews");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => buildReportParams({ ...range, domain }),
    [range, domain]
  );

  const { data, error, loading, refetch, updatedAt } = useReportQuery(
    reportsApi.pages,
    params
  );

  const rows = useMemo(() => {
    const list = Array.isArray(data?.data) ? data.data : [];
    const needle = search.trim().toLowerCase();

    const filtered = needle
      ? list.filter(
          (row) =>
            String(row.path || "").toLowerCase().includes(needle) ||
            String(row.title || "").toLowerCase().includes(needle)
        )
      : list;

    return [...filtered].sort((a, b) => {
      if (sort === "path") return String(a.path).localeCompare(String(b.path));
      return (Number(b[sort]) || 0) - (Number(a[sort]) || 0);
    });
  }, [data, search, sort]);

  const stats = useMemo(() => {
    const totalViews = rows.reduce((sum, row) => sum + (Number(row.pageViews) || 0), 0);
    const totalVisitors = rows.reduce((sum, row) => sum + (Number(row.uniqueVisitors) || 0), 0);
    const avgTime = rows.length
      ? Math.round(rows.reduce((sum, row) => sum + (Number(row.avgTime) || 0), 0) / rows.length)
      : 0;

    return {
      totalViews,
      totalVisitors,
      avgTime,
      avgViews: rows.length ? Math.round(totalViews / rows.length) : 0,
    };
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleSort = (value) => {
    setSort(value);
    setPage(1);
  };

  const maxViews = Math.max(...rows.map((row) => Number(row.pageViews) || 0), 1);

  return (
    <AdminShell
      title="Pages"
      subtitle={`Every page viewed during ${describeRange(range)}`}
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
            onClick={() => downloadCsv("docstools-pages", CSV_COLUMNS, rows)}
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
          { label: "Pages tracked", value: formatNumber(rows.length) },
          { label: "Total page views", value: formatNumber(stats.totalViews) },
          { label: "Visitor hits", value: formatNumber(stats.totalVisitors) },
          { label: "Avg time on page", value: formatDuration(stats.avgTime) },
        ]}
      />

      <section className="admin-panel">
        <div className="admin-panel-header">
          <ReportToolbar
            range={range}
            onRangeChange={(next) => {
              setRange(next);
              setPage(1);
            }}
            domain={domain}
            onDomainChange={(value) => {
              setDomain(value);
              setPage(1);
            }}
          >
            <div className="admin-field">
              <label htmlFor="pages-search">Search</label>
              <div className="admin-search-field">
                <Search size={14} aria-hidden="true" />
                <input
                  id="pages-search"
                  type="search"
                  className="admin-input admin-input--search"
                  placeholder="Path or title"
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="pages-sort">Sort by</label>
              <select
                id="pages-sort"
                className="admin-select"
                value={sort}
                onChange={(event) => handleSort(event.target.value)}
              >
                {SORTS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </ReportToolbar>
        </div>

        <ReportError error={error} onRetry={refetch} />

        <div className="admin-panel-body admin-panel-body--flush">
          {loading && !rows.length ? (
            <ReportLoading label="Loading pages…" />
          ) : !rows.length ? (
            <ReportEmpty
              title="No page views yet"
              message="Once visitors browse the site their pages will be listed here."
              icon={FileText}
            />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Page</th>
                    <th className="numeric">Views</th>
                    <th className="numeric">Visitors</th>
                    <th>Share</th>
                    <th className="numeric">Avg time</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row, index) => {
                    const share = ((Number(row.pageViews) || 0) / maxViews) * 100;
                    return (
                      <tr key={row.path || index}>
                        <td>
                          <span className={`report-rank ${index < 3 ? "report-rank--top" : ""}`}>
                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                          </span>
                        </td>
                        <td>
                          <div className="admin-cell-primary">
                            <strong className="admin-mono">{row.path}</strong>
                            {row.title && row.title !== row.path ? (
                              <span className="admin-cell-muted">{row.title}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="numeric">{formatNumber(row.pageViews)}</td>
                        <td className="numeric">{formatNumber(row.uniqueVisitors)}</td>
                        <td>
                          <div className="report-share">
                            <div className="report-share-track">
                              <div className="report-share-fill" style={{ width: `${share}%` }} />
                            </div>
                            <span className="report-share-value">{share.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="numeric">{formatDuration(row.avgTime || 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-pagination">
          <span>
            {rows.length} page{rows.length === 1 ? "" : "s"} · page {currentPage} of {totalPages}
          </span>
          <div className="admin-pagination-actions">
            <button
              type="button"
              className="admin-button admin-button--ghost admin-button--sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost admin-button--sm"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
