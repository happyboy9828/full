"use client";

import { useState } from "react";
import { KeyRound, Plus, RefreshCw, ShieldCheck, Trash2, X } from "lucide-react";

import AdminShell from "@/components/AdminShell/AdminShell";
import { useAuth, PERMISSIONS } from "@/components/AuthProvider/AuthProvider";
import { adminApi } from "@/lib/adminApi";
import { useAdminQuery } from "@/lib/useAdminQuery";
import { formatDate, formatRelative } from "@/lib/format";

const ADMIN_ROLES = ["superadmin", "admin", "analyst", "viewer"];

const EMPTY_FORM = {
  email: "",
  name: "",
  password: "",
  role: "viewer",
  recoveryPhone: "",
};

export default function AdminsPage() {
  const { user: currentUser } = useAuth();
  const { data, error, loading, refetch } = useAdminQuery(adminApi.listAdmins, {});

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const admins = data?.data || [];

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError("");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await adminApi.createAdmin({
        email: form.email,
        name: form.name,
        password: form.password,
        role: form.role,
        recoveryPhone: form.recoveryPhone,
      });
      closeModal();
      refetch();
    } catch (err) {
      setFormError(err?.message || "Could not create the administrator");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (admin, role) => {
    setActionError("");
    try {
      await adminApi.updateAdmin(admin.id, { role });
      refetch();
    } catch (err) {
      setActionError(err?.message || "Could not change the role");
    }
  };

  const handleToggleActive = async (admin) => {
    setActionError("");
    try {
      await adminApi.updateAdmin(admin.id, { isActive: !admin.isActive });
      refetch();
    } catch (err) {
      setActionError(err?.message || "Could not update the account");
    }
  };

  const handleResetPassword = async (admin) => {
    const password = window.prompt(
      `New password for ${admin.email}\n\nMinimum 8 characters, including a letter and a number.`
    );
    if (!password) return;

    setActionError("");
    try {
      await adminApi.updateAdmin(admin.id, { password });
      refetch();
    } catch (err) {
      setActionError(err?.message || "Could not reset the password");
    }
  };

  const handleDelete = async (admin) => {
    const confirmed = window.confirm(
      `Delete the account ${admin.email}? All of its sessions will be revoked.`
    );
    if (!confirmed) return;

    setActionError("");
    try {
      await adminApi.deleteAdmin(admin.id);
      refetch();
    } catch (err) {
      setActionError(err?.message || "Could not delete the account");
    }
  };

  return (
    <AdminShell
      title="Administrators"
      subtitle="Control who can sign in to the dashboard and what they can do"
      requirePermission={PERMISSIONS.ADMINS_MANAGE}
      actions={
        <>
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--sm"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Refresh
          </button>
          <button type="button" className="admin-button admin-button--sm" onClick={openCreate}>
            <Plus size={14} aria-hidden="true" />
            Add administrator
          </button>
        </>
      }
    >
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2 className="admin-panel-title">Administrator accounts</h2>
            <p className="admin-panel-subtitle">
              Roles decide which modules each administrator can reach.
            </p>
          </div>
        </div>

        {actionError ? (
          <div className="admin-error admin-panel-message" role="alert">
            {actionError}
          </div>
        ) : null}

        {error ? (
          <div className="admin-error admin-panel-message" role="alert">
            {error.message || "Could not load administrators"}
          </div>
        ) : null}

        <div className="admin-panel-body admin-panel-body--flush">
          {loading && admins.length === 0 ? (
            <div className="admin-empty">
              <p>Loading administrators…</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="admin-empty">
              <ShieldCheck size={28} aria-hidden="true" />
              <h3>No administrator accounts</h3>
              <p>Run the seed script or add an account manually.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Administrator</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last login</th>
                    <th>Created</th>
                    <th className="actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => {
                    const isSelf = currentUser && admin.id === currentUser.id;
                    return (
                      <tr key={admin.id}>
                        <td>
                          <div className="admin-cell-primary">
                            <strong>
                              {admin.name}
                              {isSelf ? " (you)" : ""}
                            </strong>
                            <span className="admin-cell-muted">{admin.email}</span>
                          </div>
                        </td>
                        <td>
                          <select
                            className="admin-select"
                            value={admin.role}
                            onChange={(event) => handleRoleChange(admin, event.target.value)}
                            disabled={isSelf}
                            aria-label={`Role for ${admin.email}`}
                          >
                            {ADMIN_ROLES.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <span
                            className={`admin-badge admin-badge--${admin.isActive ? "active" : "suspended"}`}
                          >
                            {admin.isActive ? "active" : "disabled"}
                          </span>
                        </td>
                        <td className="admin-cell-muted">{formatRelative(admin.lastLoginAt)}</td>
                        <td className="admin-cell-muted">{formatDate(admin.createdAt)}</td>
                        <td className="actions">
                          <div className="admin-table-actions">
                            <button
                              type="button"
                              className="admin-button admin-button--ghost admin-button--icon"
                              onClick={() => handleResetPassword(admin)}
                              aria-label={`Reset password for ${admin.email}`}
                              title="Reset password"
                            >
                              <KeyRound size={14} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="admin-button admin-button--ghost admin-button--sm"
                              onClick={() => handleToggleActive(admin)}
                              disabled={isSelf}
                            >
                              {admin.isActive ? "Disable" : "Enable"}
                            </button>
                            <button
                              type="button"
                              className="admin-button admin-button--danger admin-button--icon"
                              onClick={() => handleDelete(admin)}
                              disabled={isSelf}
                              aria-label={`Delete ${admin.email}`}
                              title="Delete account"
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {modalOpen ? (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2 id="admin-modal-title">Add administrator</h2>
              <button
                type="button"
                className="admin-button admin-button--ghost admin-button--icon"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="admin-modal-body">
                {formError ? (
                  <div className="admin-error" role="alert">
                    {formError}
                  </div>
                ) : null}

                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label htmlFor="admin-name">Full name</label>
                    <input
                      id="admin-name"
                      className="admin-input"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="admin-email">Email</label>
                    <input
                      id="admin-email"
                      type="email"
                      className="admin-input"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="admin-password">Password</label>
                    <input
                      id="admin-password"
                      type="password"
                      className="admin-input"
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="admin-role">Role</label>
                    <select
                      id="admin-role"
                      className="admin-select"
                      value={form.role}
                      onChange={(event) => setForm({ ...form, role: event.target.value })}
                    >
                      {ADMIN_ROLES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="admin-phone">Recovery phone</label>
                    <input
                      id="admin-phone"
                      className="admin-input"
                      placeholder="+14155552671"
                      value={form.recoveryPhone}
                      onChange={(event) => setForm({ ...form, recoveryPhone: event.target.value })}
                    />
                  </div>
                </div>

                <p className="admin-cell-muted">
                  The recovery phone is used only for SMS password recovery codes.
                </p>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-button admin-button--ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-button" disabled={saving}>
                  {saving ? "Creating…" : "Create administrator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
