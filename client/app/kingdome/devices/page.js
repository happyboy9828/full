"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const DevicesModule = dynamic(() => import("@/components/AdminReports/DevicesModule"), {
  ssr: false,
  loading: () => (
    <div className="dashboard-shell">
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Devices...</p>
      </div>
    </div>
  ),
});

export default function DevicesPage() {
  return (
    <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
      <DevicesModule />
    </Suspense>
  );
}
