"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const DashboardClient = dynamic(() => import("./DashboardClient"), {
  ssr: false,
  loading: () => (
    <div className="dashboard-shell">
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
      <DashboardClient />
    </Suspense>
  );
}
