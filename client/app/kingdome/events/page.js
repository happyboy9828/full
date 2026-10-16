"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { MousePointerClick } from "lucide-react";

const EventsClient = dynamic(() => import("@/components/ComingSoon/ComingSoonClient"), {
  ssr: false,
  loading: () => (
    <div className="dashboard-shell">
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Events...</p>
      </div>
    </div>
  ),
});

export default function EventsPage() {
  return (
    <div className="dashboard-page">
      <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
        <EventsClient featureName="Events" Icon={MousePointerClick} />
      </Suspense>
    </div>
  );
}
