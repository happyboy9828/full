"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { MonitorSmartphone } from "lucide-react";

const DevicesClient = dynamic(() => import("@/components/ComingSoon/ComingSoonClient"), {
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
    <div className="dashboard-page">
      <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
        <DevicesClient featureName="Devices" Icon={MonitorSmartphone} />
      </Suspense>
    </div>
  );
}
