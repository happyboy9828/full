"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, LogOut, RefreshCw, Save, ShieldCheck } from "lucide-react";

import AdminShell from "@/components/AdminShell/AdminShell";
import { useAuth, PERMISSIONS } from "@/components/AuthProvider/AuthProvider";
import { authApi } from "@/lib/adminApi";
import { formatDate, formatRelative } from "@/lib/format";

/**
 * Profile & security.
 *
 * - Update the signed-in administrator's display name and recovery phone.
 * - Change the account password (all other sessions are revoked server-side).
 * - List and revoke the account's active sessions.
 */
export default function SettingsPage() {
  const { user, setUser, verifyAuth } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [profileState, setProfileState] = useState({ error: "", success: "", saving: false });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordState, setPasswordState] = useState({ error: "", success: "", saving: false });

  const [sessions, setSessions] = useState([]);
  const [sessionsError, setSessionsError] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    setSessionsError("");
    try {
      const result = await authApi.listSessions();
      setSessions(result?.data || []);
    } catch (err) {
      setSessionsError(err?.message || "Could not load sessions");
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const result = await authApi.listSessions();
        if (!active) return;
        setSessions(result?.data || []);
      } catch (err) {
        if (!active) return;
        setSessionsError(err?.message || "Could not load sessions");
      } finally {
        if (active) setLoadingSessions(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileState({ error: "", success: "", saving: true });
    try {
      const result = await authApi.updateProfile({ name, recoveryPhone });
      if (result?.user) {
        setUser({ ...user, ...result.user });
      }
      await verifyAuth();
      setProfileState({
        error: "",
        success: "Profile updated.",
        saving: false,
      });
    } catch (err) {
      setProfileState({
        error: err?.message || "Could not update the profile",
        success: "",
        saving: false,
      });
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    setPasswordState({ error: "", success: "", saving: true });

    if (newPassword !== confirmPassword) {
      setPasswordState({
        error: "The new passwords do not match.",
        success: "",
        saving: false,
      });
      return;
    }

    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordState({
        error: "",
        success: "Password changed. Other sessions were signed out.",
        saving: false,
      });
      loadSessions();
    } catch (err) {
      setPasswordState({
        error: err?.message || "Could not change the password",
        success: "",
        saving: false,
      });
    }
  };

  const handleRevoke = async (session) => {
    setSessionsError("");
    try {
      await authApi.revokeSession(session.id);
      await loadSessions();
    } catch (err) {
      setSessionsError(err?.message || "Could not revoke the session");
    }
  };

  return (
    <AdminShell
      title="Settings"
      subtitle="Your profile, password and active sessions"
      requirePermission={PERMISSIONS.SETTINGS_VIEW}
    >
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2 className="admin-panel-title">Profile</h2>
            <p className="admin-panel-subtitle">
              Signed in as {user?.email} · {user?.roleLabel}
            </p>
          </div>
          <span className={`admin-role-badge admin-role-badge--${user?.role || "viewer"}`}>
            <ShieldCheck size={12} aria-hidden="true" />
            {user?.roleLabel || "Unknown role"}
          </span>
        </div>

        <form className="admin-panel-body" onSubmit={handleProfileSave}>
          {profileState.error ? (
            <div className="admin-error" role="alert" style={{ marginBottom: 16 }}>
              {profileState.error}
            </div>
          ) : null}
          {profileState.success ? (
            <div className="admin-success" role="status" style={{ marginBottom: 16 }}>
              {profileState.success}
            </div>
          ) : null}

          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="settings-email">Email</label>
              <input id="settings-email" className="admin-input" value={user?.email || ""} disabled />
            </div>

            <div className="admin-field">
              <label htmlFor="settings-name">Display name</label>
              <input
                id="settings-name"
                className="admin-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="settings-phone">Recovery phone</label>
              <input
                id="settings-phone"
                className="admin-input"
                placeholder="+14155552671"
                value={recoveryPhone}
                onChange={(event) => setRecoveryPhone(event.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-button" disabled={profileState.saving}>
              <Save size={15} aria-hidden="true" />
              {profileState.saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2 className="admin-panel-title">Change password</h2>
            <p className="admin-panel-subtitle">
              Minimum 8 characters with at least one letter and one number.
            </p>
          </div>
          <KeyRound size={18} aria-hidden="true" />
        </div>

        <form className="admin-panel-body" onSubmit={handlePasswordSave}>
          {passwordState.error ? (
            <div className="admin-error" role="alert" style={{ marginBottom: 16 }}>
              {passwordState.error}
            </div>
          ) : null}
          {passwordState.success ? (
            <div className="admin-success" role="status" style={{ marginBottom: 16 }}>
              {passwordState.success}
            </div>
          ) : null}

          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="settings-current-password">Current password</label>
              <input
                id="settings-current-password"
                type="password"
                className="admin-input"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="settings-new-password">New password</label>
              <input
                id="settings-new-password"
                type="password"
                className="admin-input"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="settings-confirm-password">Confirm new password</label>
              <input
                id="settings-confirm-password"
                type="password"
                className="admin-input"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-button" disabled={passwordState.saving}>
              {passwordState.saving ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2 className="admin-panel-title">Active sessions</h2>
            <p className="admin-panel-subtitle">
              Every device that currently holds a valid admin session.
            </p>
          </div>
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--sm"
            onClick={loadSessions}
            disabled={loadingSessions}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Refresh
          </button>
        </div>

        {sessionsError ? (
          <div className="admin-error admin-panel-message" role="alert">
            {sessionsError}
          </div>
        ) : null}

        <div className="admin-panel-body admin-panel-body--flush">
          {loadingSessions && sessions.length === 0 ? (
            <div className="admin-empty">
              <p>Loading sessions…</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="admin-empty">
              <h3>No active sessions</h3>
              <p>Sign in again from another device to see it listed here.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Signed in</th>
                    <th>Last activity</th>
                    <th>Expires</th>
                    <th className="actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <div className="admin-cell-primary">
                          <strong>{session.current ? "This device" : "Another device"}</strong>
                          <span className="admin-cell-muted">
                            {session.userAgent || "Unknown device"}
                          </span>
                        </div>
                      </td>
                      <td className="admin-cell-muted">{formatDate(session.createdAt, { withTime: true })}</td>
                      <td className="admin-cell-muted">{formatRelative(session.lastActivityAt)}</td>
                      <td className="admin-cell-muted">{formatDate(session.expiresAt, { withTime: true })}</td>
                      <td className="actions">
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="admin-button admin-button--ghost admin-button--sm"
                            onClick={() => handleRevoke(session)}
                          >
                            <LogOut size={13} aria-hidden="true" />
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
