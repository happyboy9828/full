"use client";

import { useState } from "react";
import "./FeedbackForm.css";

const API = (process.env.NEXT_PUBLIC_TRACKING_API || "http://localhost:5000/api/analytics").replace(/\/analytics$/, "");

export default function FeedbackForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const res = await fetch(`${API}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  };

  if (status === "success") {
    return (
      <div className="feedback-success" role="status">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h3>Thank you for your feedback!</h3>
        <p>We appreciate you taking the time to share your thoughts.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="feedback-submit-btn"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="feedback-form" noValidate>
      <div className="feedback-field">
        <label htmlFor="feedback-name">Name *</label>
        <input
          type="text"
          id="feedback-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={100}
          placeholder="Your name"
          disabled={status === "submitting"}
          aria-describedby={error ? "feedback-error" : undefined}
        />
      </div>

      <div className="feedback-field">
        <label htmlFor="feedback-email">Email *</label>
        <input
          type="email"
          id="feedback-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          maxLength={255}
          placeholder="your@email.com"
          disabled={status === "submitting"}
          aria-describedby={error ? "feedback-error" : undefined}
        />
      </div>

      <div className="feedback-field">
        <label htmlFor="feedback-message">Feedback *</label>
        <textarea
          id="feedback-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          maxLength={5000}
          rows={5}
          placeholder="Tell us what you think, report a bug, or suggest a feature..."
          disabled={status === "submitting"}
          aria-describedby={error ? "feedback-error" : undefined}
        />
      </div>

      {error && (
        <div id="feedback-error" className="feedback-error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="feedback-submit-btn"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <span className="spinner" aria-hidden="true"></span>
            Sending...
          </>
        ) : (
          "Send Feedback"
        )}
      </button>

      <p className="feedback-note">No login required. We'll never share your email.</p>
    </form>
  );
}