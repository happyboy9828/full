"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import Sidebar from "@/components/Sidebar/Sidebar";

const REPORT_BASE = "/api/analytics/reports";

async function fetchReport(reportName, params = {}) {
  const url = new URL(`${REPORT_BASE}/${reportName}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  const res = await fetch(url, { credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to fetch");
  return json.data;
}

function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
}

function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

function MetricCard({ title, value, change, icon, trend = "up" }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-value">{value}</div>
      {change && (
        <div className={`metric-change ${trend}`}>
          <span className="change-icon">{trend === "up" ? "↑" : "↓"}</span>
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}

function MiniChart({ data, color = "var(--tool-accent)", height = 60 }) {
  if (!data?.length) return <div className="mini-chart-empty">No data</div>;
  
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 100;
    return `${x}%,${y}%`;
  }).join(" ");

  return (
    <div className="mini-chart" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M${points.replace(/,/g, " L")}`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M${points.replace(/,/g, " L")} L100,100 L0,100 Z`}
          fill="url(#chartGradient)"
        />
      </svg>
    </div>
  );
}

function TopPagesTable({ pages }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Page</th>
            <th className="numeric">Views</th>
            <th className="numeric">Visitors</th>
            <th className="numeric">Avg Time</th>
          </tr>
        </thead>
        <tbody>
          {pages.slice(0, 10).map((page, i) => (
            <tr key={page.path}>
              <td>
                <span className="rank-badge">#{i + 1}</span>
                <div className="page-info">
                  <span className="page-path">{page.path}</span>
                  {page.title && page.title !== page.path && (
                    <span className="page-title">{page.title}</span>
                  )}
                </div>
              </td>
              <td className="numeric">{formatNumber(page.pageViews)}</td>
              <td className="numeric">{formatNumber(page.uniqueVisitors)}</td>
              <td className="numeric">{formatDuration(page.avgTime || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SourcesChart({ sources }) {
  const total = sources.reduce((sum, s) => sum + s.visits, 0);
  return (
    <div className="sources-chart">
      {sources.slice(0, 8).map((source) => (
        <div key={source.source} className="source-bar">
          <div className="source-label" title={source.source}>
            {source.source.length > 25 ? source.source.slice(0, 22) + "..." : source.source}
          </div>
          <div className="source-bar-track">
            <div 
              className="source-bar-fill" 
              style={{ width: `${(source.visits / total) * 100}%` }}
            ></div>
          </div>
          <div className="source-value">
            {formatNumber(source.visits)} ({source.percentage}%)
          </div>
        </div>
      ))}
    </div>
  );
}

function DevicesChart({ devices }) {
  const total = devices.reduce((sum, d) => sum + d.count, 0);
  return (
    <div className="devices-chart">
      {devices.map((device) => (
        <div key={device.type} className="device-row">
          <div className="device-info">
            <span className="device-icon">
              {device.type === "mobile" ? "📱" : device.type === "tablet" ? "📟" : "💻"}
            </span>
            <span className="device-name">
              {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
            </span>
          </div>
          <div className="device-bar-track">
            <div 
              className="device-bar-fill" 
              style={{ width: `${(device.count / total) * 100}%` }}
            ></div>
          </div>
          <div className="device-value">
            {formatNumber(device.count)} ({device.percentage}%)
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveVisitors({ liveData }) {
  if (!liveData) return null;
  
  return (
    <div className="live-visitors">
      <div className="live-header">
        <span className="live-indicator">
          <span className="live-dot"></span>
          LIVE
        </span>
        <span className="live-count">{liveData.activeVisitors} active</span>
      </div>
      <div className="recent-events">
        {liveData.recentEvents?.slice(0, 5).map((event) => (
          <div key={event.eventId} className="recent-event">
            <span className="event-time">
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
            <span className="event-path">{event.path || "/"}</span>
            <span className={`event-type ${event.eventType}`}>{event.eventType}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const { authenticated } = useAuth();
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0]
  });
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [overview, setOverview] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [sources, setSources] = useState([]);
  const [devices, setDevices] = useState([]);
  const [liveData, setLiveData] = useState(null);

  const params = useMemo(() => ({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    domain: domain || undefined,
  }), [dateRange, domain]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, timeSeriesData, pagesData, sourcesData, devicesData, liveDataResult] = await Promise.all([
        fetchReport("overview", params),
        fetchReport("time-series", { ...params, granularity: "day" }),
        fetchReport("pages", params),
        fetchReport("sources", params),
        fetchReport("devices", params),
        fetchReport("live", params),
      ]);
      
      setOverview(overviewData);
      setTimeSeries(timeSeriesData);
      setTopPages(pagesData);
      setSources(sourcesData);
      setDevices(devicesData?.deviceTypes || []);
      setLiveData(liveDataResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchAllData();
    }
  }, [authenticated, params]);

  const handleRefresh = () => {
    fetchAllData();
  };

  let shellContent;

  if (!authenticated) {
    shellContent = (
      <div className="dashboard-shell">
        <div className="auth-required">
          <h2>🔒 Admin Access Required</h2>
          <p>Please log in to view the traffic management dashboard.</p>
        </div>
      </div>
    );
  } else if (loading && !overview) {
    shellContent = (
      <div className="dashboard-shell">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  } else if (error) {
    shellContent = (
      <div className="dashboard-shell">
        <div className="dashboard-error">
          <h3>Failed to load dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>Retry</button>
        </div>
      </div>
    );
  } else {
    const metrics = [
      {
        title: "Page Views",
        value: formatNumber(overview?.pageViews || 0),
        change: overview?.pageViews ? "+12.5%" : null,
        icon: "📊",
        trend: "up"
      },
      {
        title: "Unique Visitors",
        value: formatNumber(overview?.uniqueVisitors || 0),
        change: overview?.uniqueVisitors ? "+8.2%" : null,
        icon: "👥",
        trend: "up"
      },
      {
        title: "Sessions",
        value: formatNumber(overview?.sessions || 0),
        change: overview?.sessions ? "+5.1%" : null,
        icon: "🔄",
        trend: "up"
      },
      {
        title: "Bounce Rate",
        value: overview?.bounceRate ? `${overview.bounceRate}%` : "0%",
        change: overview?.bounceRate ? "-2.3%" : null,
        icon: "📉",
        trend: "down"
      },
      {
        title: "Avg Session Duration",
        value: formatDuration(overview?.avgSessionDuration || 0),
        change: overview?.avgSessionDuration ? "+15s" : null,
        icon: "⏱️",
        trend: "up"
      },
      {
        title: "Pages / Session",
        value: overview?.avgPagesPerSession ? overview.avgPagesPerSession.toFixed(1) : "0",
        change: overview?.avgPagesPerSession ? "+0.2" : null,
        icon: "📄",
        trend: "up"
      }
    ];
    shellContent = (
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">Traffic Dashboard</h1>
            <p className="dashboard-subtitle">Real-time traffic management & analytics</p>
          </div>
          <div className="header-right">
            <div className="date-range-picker">
              <label>
                <span>From</span>
                <input 
                  type="date" 
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  max={dateRange.endDate}
                />
              </label>
              <label>
                <span>To</span>
                <input 
                  type="date" 
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  min={dateRange.startDate}
                  max={new Date().toISOString().split("T")[0]}
                />
              </label>
            </div>
            <div className="domain-filter">
              <label>
                <span>Domain</span>
                <input 
                  type="text" 
                  placeholder="All domains"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </label>
            </div>
            <button className="btn btn-secondary" onClick={handleRefresh}>
              <span>↻</span> Refresh
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="metrics-section" aria-label="Key metrics">
            {metrics.map((metric, i) => (
              <MetricCard key={i} {...metric} />
            ))}
          </section>

          <section className="chart-section main-chart" aria-label="Traffic over time">
            <div className="section-header">
              <h2>Traffic Overview</h2>
              <select 
                className="granularity-select"
                defaultValue="day"
                onChange={(e) => fetchReport("time-series", { ...params, granularity: e.target.value })
                  .then(setTimeSeries)
                  .catch(console.error)}
              >
                <option value="day">Daily</option>
                <option value="hour">Hourly</option>
              </select>
            </div>
            <div className="time-series-chart">
              <TimeSeriesChart data={timeSeries} />
            </div>
          </section>

          <section className="chart-section top-pages" aria-label="Top pages">
            <div className="section-header">
              <h2>Top Pages</h2>
            </div>
            <TopPagesTable pages={topPages} />
          </section>

          <section className="chart-section sources" aria-label="Traffic sources">
            <div className="section-header">
              <h2>Traffic Sources</h2>
            </div>
            <SourcesChart sources={sources} />
          </section>

          <section className="chart-section devices" aria-label="Devices">
            <div className="section-header">
              <h2>Devices</h2>
            </div>
            <DevicesChart devices={devices} />
          </section>

          <section className="chart-section live" aria-label="Live visitors">
            <div className="section-header">
              <h2>Live Visitors</h2>
            </div>
            <LiveVisitors liveData={liveData} />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">{shellContent}</main>
    </div>
  );
}

function TimeSeriesChart({ data }) {
  if (!data?.length) return <div className="chart-empty">No data available for this period</div>;

  const maxViews = Math.max(...data.map(d => d.pageViews));
  const maxSessions = Math.max(...data.map(d => d.sessions));
  const maxValue = Math.max(maxViews, maxSessions) || 1;

  return (
    <div className="time-series-svg">
      <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="chart-svg">
        <defs>
          <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--tool-accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--tool-accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--tool-secondary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--tool-secondary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <g className="chart-grid">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line 
              key={i}
              x1="60" y1={40 + ratio * 140} 
              x2="780" y2={40 + ratio * 140}
              stroke="var(--tool-border)"
              strokeWidth="0.5"
              strokeDasharray="4,4"
            />
          ))}
        </g>

        {/* Pre-compute path data */}
        {(() => {
          if (data.length < 2) return null;
          
          const viewsPath = data.map((d, i) => {
            const x = 60 + (i / (data.length - 1)) * 720;
            const y = 180 - (d.pageViews / maxValue) * 140;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          }).join(" ") + " L 780 180 L 60 180 Z";
          
          const sessionsPath = data.map((d, i) => {
            const x = 60 + (i / (data.length - 1)) * 720;
            const y = 180 - (d.sessions / maxValue) * 140;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          }).join(" ") + " L 780 180 L 60 180 Z";
          
          const viewsLine = data.map((d, i) => {
            const x = 60 + (i / (data.length - 1)) * 720;
            const y = 180 - (d.pageViews / maxValue) * 140;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          }).join(" ");
          
          const sessionsLine = data.map((d, i) => {
            const x = 60 + (i / (data.length - 1)) * 720;
            const y = 180 - (d.sessions / maxValue) * 140;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          }).join(" ");

          return (
            <>
              {/* Views area */}
              <path d={viewsPath} fill="url(#viewsGradient)" />
              
              {/* Sessions area */}
              <path d={sessionsPath} fill="url(#sessionsGradient)" />
              
              {/* Views line */}
              <path
                d={viewsLine}
                fill="none"
                stroke="var(--tool-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Sessions line */}
              <path
                d={sessionsLine}
                fill="none"
                stroke="var(--tool-secondary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              <g className="chart-points">
                {data.map((d, i) => {
                  const x = 60 + (i / (data.length - 1)) * 720;
                  const yViews = 180 - (d.pageViews / maxValue) * 140;
                  const ySessions = 180 - (d.sessions / maxValue) * 140;
                  return (
                    <g key={i} className="data-point-group">
                      <circle 
                        cx={x} cy={yViews} r="4"
                        fill="var(--tool-accent)"
                        stroke="var(--background)"
                        strokeWidth="2"
                        className="chart-point"
                      />
                      <circle 
                        cx={x} cy={ySessions} r="4"
                        fill="var(--tool-secondary)"
                        stroke="var(--background)"
                        strokeWidth="2"
                        className="chart-point"
                      />
                      <title>{d.date}: {d.pageViews} views, {d.sessions} sessions</title>
                    </g>
                  );
                })}
              </g>
            </>
          );
        })()}
      </svg>
      
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-color" style={{ background: "var(--tool-accent)" }}></span>
          Page Views
        </span>
        <span className="legend-item">
          <span className="legend-color" style={{ background: "var(--tool-secondary)" }}></span>
          Sessions
        </span>
      </div>
    </div>
  );
}