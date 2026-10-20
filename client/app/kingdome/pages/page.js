"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const PagesModule = dynamic(() => import("@/components/AdminReports/PagesModule"), {
  ssr: false,
  loading: () => (
    <div className="dashboard-shell">
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Pages...</p>
      </div>
    </div>
  ),
});

export default function PagesPage() {
  return (
    <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
      <PagesModule />
    </Suspense>
  );
}
