"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const EventsModule = dynamic(() => import("@/components/AdminReports/EventsModule"), {
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
    <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
      <EventsModule />
    </Suspense>
  );
}
