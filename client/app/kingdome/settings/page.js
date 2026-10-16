"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Settings } from "lucide-react";

const SettingsClient = dynamic(() => import("@/components/ComingSoon/ComingSoonClient"), {
  ssr: false,
  loading: () => (
    <div className="dashboard-shell">
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Settings...</p>
      </div>
    </div>
  ),
});

export default function SettingsPage() {
  return (
    <div className="dashboard-page">
      <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
        <SettingsClient featureName="Settings" Icon={Settings} />
      </Suspense>
    </div>
  );
}
