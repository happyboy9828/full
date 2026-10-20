"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const TrafficSourcesModule = dynamic(
  () => import("@/components/AdminReports/TrafficSourcesModule"),
  {
    ssr: false,
    loading: () => (
      <div className="dashboard-shell">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading Traffic Sources...</p>
        </div>
      </div>
    ),
  }
);

export default function TrafficSourcesPage() {
  return (
    <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
      <TrafficSourcesModule />
    </Suspense>
  );
}
