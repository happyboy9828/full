"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Users } from "lucide-react";

const LiveVisitorsClient = dynamic(() => import("@/components/ComingSoon/ComingSoonClient"), {
  ssr: false,
  loading: () => (
    <div className="dashboard-shell">
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Live Visitors...</p>
      </div>
    </div>
  ),
});

export default function LiveVisitorsPage() {
  return (
    <div className="dashboard-page">
      <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
        <LiveVisitorsClient featureName="Live Visitors" Icon={Users} />
      </Suspense>
    </div>
  );
}
