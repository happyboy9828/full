"use client";

export default function TimeSeriesChart({ data, height = 160 }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.pageViews || d.events || 0), 1);
  const chartWidth = 100;

  return (
    <div className="tool-chart">
      <div className="tool-chart-y">
        {[0, 25, 50, 75, 100].map((p) => (
          <span key={p} className="tool-chart-y-label">
            {Math.round((p / 100) * maxVal)}
          </span>
        ))}
      </div>
      <div className="tool-chart-body">
        <svg viewBox={`0 0 ${data.length * chartWidth} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--tool-accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--tool-accent)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {data.map((d, i) => {
            const barHeight = ((d.pageViews || 0) / maxVal) * (height - 20);
            const x = i * chartWidth + chartWidth / 2;
            const barW = Math.max(2, chartWidth - 8);
            return (
              <g key={i} transform={`translate(${x - barW / 2}, 0)`}>
                <rect
                  x={0}
                  y={height - 20 - barHeight}
                  width={barW}
                  height={barHeight}
                  fill="url(#chart-gradient)"
                  stroke="var(--tool-accent)"
                  strokeWidth={1}
                  rx={2}
                />
                <title>{d.date?.split("T")[0] || ""}: {d.pageViews} page views</title>
              </g>
            );
          })}
          <path
            d={buildLinePath(data, maxVal, height, chartWidth)}
            fill="none"
            stroke="var(--tool-accent)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="tool-chart-x">
        {data.map((d, i) => {
          if (data.length > 8 && i % Math.ceil(data.length / 8) !== 0 && i !== data.length - 1) {
            return null;
          }
          const parts = d.date?.split("T")[0]?.split("-");
          const short = parts ? `${parts[1]}-${parts[2]}` : "";
          return (
            <span key={i} className="tool-chart-x-label">
              {short}
            </span>
          );
        })}
      </div>

      <style>{`
        .tool-chart { display: flex; align-items: flex-end; gap: 8px; font-size: 10px; }
        .tool-chart-y { display: flex; flex-direction: column; gap: 4px; justify-content: space-between; height: ${height}px; }
        .tool-chart-y-label { color: var(--tool-muted); }
        .tool-chart-body { flex: 1; }
        .tool-chart svg { width: 100%; height: ${height}px; }
        .tool-chart-x { display: flex; justify-content: space-between; margin-top: 4px; }
        .tool-chart-x-label { color: var(--tool-muted); }
      `}</style>
    </div>
  );
}

function buildLinePath(data, maxVal, height, chartWidth) {
  if (data.length < 2) return "";
  const pts = [];
  const offsetY = height - 20;
  data.forEach((d, i) => {
    const x = i * chartWidth + chartWidth / 2;
    const y = offsetY - ((d.pageViews || 0) / maxVal) * (height - 20);
    pts.push(`${x},${y}`);
  });
  return `M ${pts.join(" L ")}`;
}
