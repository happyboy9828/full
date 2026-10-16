"use client";

import Sidebar from "@/components/Sidebar/Sidebar";

import "./ComingSoon.css";

export default function ComingSoonClient({ featureName, Icon: IconComponent }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="coming-soon-wrapper">
          <div className="coming-soon-card">
            <div className="coming-soon-icon">
              <IconComponent size={48} strokeWidth={2} />
            </div>
            <h1 className="coming-soon-title">{featureName}</h1>
            <p className="coming-soon-description">
              {featureName} is coming soon. This feature will be available in a future update.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
