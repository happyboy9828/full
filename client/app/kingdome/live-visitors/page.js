"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const LiveVisitorsModule = dynamic(
  () => import("@/components/AdminReports/LiveVisitorsModule"),
  {
    ssr: false,
    loading: () => (
      <div className="dashboard-shell">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading Live Visitors...</p>
        </div>
      </div>
    ),
  }
);

export default function LiveVisitorsPage() {
  return (
    <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
      <LiveVisitorsModule />
    </Suspense>
  );
}
