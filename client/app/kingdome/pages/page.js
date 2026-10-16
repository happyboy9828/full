"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { FileText } from "lucide-react";

const PagesClient = dynamic(() => import("@/components/ComingSoon/ComingSoonClient"), {
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
    <div className="dashboard-page">
      <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div></div>}>
        <PagesClient featureName="Pages" Icon={FileText} />
      </Suspense>
    </div>
  );
}
