"use client";

<<<<<<< HEAD
import { useEffect, useState, useMemo, useCallback } from "react";
import DateRangePicker from "./DateRangePicker";
import OverviewView from "./views/OverviewView";
import SourcesView from "./views/SourcesView";
import PagesView from "./views/PagesView";
import DevicesView from "./views/DevicesView";
import EventsView from "./views/EventsView";
import LiveView from "./views/LiveView";
import { checkAuth, login, logout } from "@/lib/analyticsApi";

const VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "sources", label: "Traffic Sources" },
  { id: "pages", label: "Top Pages" },
  { id: "devices", label: "Devices" },
  { id: "events", label: "Events" },
  { id: "live", label: "Live Activity" },
];
=======
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
>>>>>>> e16a166025edd9e98d928564e8d1cf640896f67b

export default function AnalyticsDashboard() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(null);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [activeView, setActiveView] = useState("overview");
  const [dateRange, setDateRange] = useState({ preset: "30d", startDate: "", endDate: "" });

  const reportParams = useMemo(() => {
    return {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }, [dateRange]);
=======
>>>>>>> e16a166025edd9e98d928564e8d1cf640896f67b

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
<<<<<<< HEAD
        const r = await checkAuth();
        if (!cancelled) setAuthenticated(r.authenticated);
=======
        const r = await authApi("/me");
        if (!cancelled) setAuthenticated(r.json?.authenticated === true);
>>>>>>> e16a166025edd9e98d928564e8d1cf640896f67b
      } catch {
        if (!cancelled) setAuthenticated(false);
      }
    }
    check();
<<<<<<< HEAD
    return () => {
      cancelled = true;
    };
=======
    return () => { cancelled = true; };
>>>>>>> e16a166025edd9e98d928564e8d1cf640896f67b
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
<<<<<<< HEAD
      const r = await login(password);
=======
      const r = await authApi("/login", { method: "POST", body: { password } });
>>>>>>> e16a166025edd9e98d928564e8d1cf640896f67b
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
<<<<<<< HEAD
      await logout();
    } catch {
      /* ignore */
    }
    setAuthenticated(false);
  }

  const renderView = useCallback(() => {
    const commonProps = { params: reportParams };
    switch (activeView) {
      case "overview":
        return <OverviewView {...commonProps} />;
      case "sources":
        return <SourcesView {...commonProps} />;
      case "pages":
        return <PagesView {...commonProps} />;
      case "devices":
        return <DevicesView {...commonProps} />;
      case "events":
        return <EventsView {...commonProps} />;
      case "live":
        return <LiveView {...commonProps} />;
      default:
        return <OverviewView {...commonProps} />;
    }
  }, [activeView, reportParams]);

=======
      await authApi("/logout", { method: "POST" });
    } catch { /* ignore */ }
    setAuthenticated(false);
  }

>>>>>>> e16a166025edd9e98d928564e8d1cf640896f67b
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
<<<<<<< HEAD
        <h2 style={{ margin: "0 0 14px" }}>Sign in to Analytics</h2>
=======
        <h2 style={{ margin: "0 0 14px" }}>Sign in</h2>
>>>>>>> e16a166025edd9e98d928564e8d1cf640896f67b
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
<<<<<<< HEAD
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--tool-gap)" }}>
      <div className="tool-card">
        <div className="tool-row" style={{ padding: "10px 0" }}>
          <div>
            <p className="tool-muted" style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Analytics Dashboard
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--tool-muted)" }}>
              Authenticated session active. Data updates with your date filters.
            </p>
          </div>
          <button type="button" className="tool-btn tool-btn-ghost tool-btn-small" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="tool-card">
        <p className="tool-card-title" style={{ margin: "0 0 10px" }}>Date Range</p>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <div className="tool-card" style={{ padding: 0, overflow: "hidden" }}>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 1, backgroundColor: "var(--tool-surface-2)" }}>
          {VIEWS.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setActiveView(view.id)}
              className="tool-btn tool-btn-small"
              style={{
                borderRadius: 0,
                borderBottom: activeView === view.id ? "3px solid var(--tool-accent)" : "3px solid transparent",
                fontWeight: activeView === view.id ? 600 : 400,
                color: activeView === view.id ? "var(--tool-accent-text)" : "var(--tool-muted)",
                background: activeView === view.id ? "var(--tool-surface)" : "var(--tool-surface-2)",
                fontSize: 13,
              }}
            >
              {view.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "var(--tool-card-pad)" }}>{renderView()}</div>
      </div>
    </div>
  );
}
=======
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
>>>>>>> e16a166025edd9e98d928564e8d1cf640896f67b
