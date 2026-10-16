"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ChartNoAxesCombined } from "lucide-react";

const TrafficSourcesClient = dynamic(() => import("@/components/ComingSoon/ComingSoonClient"), {
  ssr: false,
  loading: () => (
    <div className="dashboard-shell">
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Traffic Sources...</p>
      </div>
    </div>
  ),
});

export default function TrafficSourcesPage() {
  return (
    <div className="dashboard-page">
      <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
        <TrafficSourcesClient featureName="Traffic Sources" Icon={ChartNoAxesCombined} />
      </Suspense>
    </div>
  );
}
