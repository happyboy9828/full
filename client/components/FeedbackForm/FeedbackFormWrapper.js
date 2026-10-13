"use client";

import dynamic from "next/dynamic";

const FeedbackForm = dynamic(() => import("./FeedbackForm"), {
  ssr: false,
  loading: () => (
    <div className="feedback-form-loading" style={{ padding: "2rem", textAlign: "center" }}>
      <div className="spinner" style={{ margin: "0 auto 1rem", width: "24px", height: "24px" }}></div>
      <p style={{ color: "var(--text-muted, #9ca3af)" }}>Loading feedback form...</p>
    </div>
  ),
});

export default function FeedbackFormWrapper() {
  return <FeedbackForm />;
}