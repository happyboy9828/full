"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_TRACKING_API || "http://localhost:5000/api";

async function authApi(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(API + "/auth" + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  let json = null;
  const text = await res.text();
  try { json = JSON.parse(text); } catch { /* keep null */ }
  return { status: res.status, json };
}

export default function AnalyticsDashboard() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const r = await authApi("/me");
        if (!cancelled) setAuthenticated(r.json?.authenticated === true);
      } catch {
        if (!cancelled) setAuthenticated(false);
      }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await authApi("/login", { method: "POST", body: { password } });
      if (r.status === 200 && r.json?.success) {
        setAuthenticated(true);
        setPassword("");
      } else {
        setError(r.json?.error || "Invalid credentials");
      }
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await authApi("/logout", { method: "POST" });
    } catch { /* ignore */ }
    setAuthenticated(false);
  }

  if (authenticated === null) {
    return (
      <div className="tool-card">
        <p className="tool-muted" style={{ margin: 0 }}>Checking session…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="tool-card" style={{ maxWidth: 420 }}>
        <h2 style={{ margin: "0 0 14px" }}>Sign in</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="tool-input"
            autoFocus
            disabled={loading}
          />
          <button type="submit" className="tool-btn tool-btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {error && <p className="tool-alert" style={{ margin: 0 }}>{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="tool-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>You are signed in</p>
          <p style={{ margin: "4px 0 0", color: "var(--tool-muted)", fontSize: 13 }}>Session is active. Reports are available via the API.</p>
        </div>
        <button type="button" className="tool-btn tool-btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="tool-card">
        <p className="tool-muted" style={{ margin: 0 }}>
          Dashboard views (Phase 7) will render data from the protected reporting endpoints.
        </p>
      </div>
    </div>
  );
}