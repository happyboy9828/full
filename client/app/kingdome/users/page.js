"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCog,
  X,
} from "lucide-react";

import AdminShell from "@/components/AdminShell/AdminShell";
import { useAuth, PERMISSIONS } from "@/components/AuthProvider/AuthProvider";
import { adminApi } from "@/lib/adminApi";
import { useAdminQuery } from "@/lib/useAdminQuery";
import { formatDate, formatRelative } from "@/lib/format";

const ROLES = ["owner", "admin", "member", "viewer"];
const STATUSES = ["active", "invited", "suspended"];
const PLANS = ["free", "pro", "team", "enterprise"];

const EMPTY_FORM = {
  name: "",
  email: "",
  company: "",
  role: "member",
  status: "invited",
  plan: "free",
  phone: "",
  notes: "",
};

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.USERS_MANAGE);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const params = useMemo(
    () => ({ search: search.trim(), status, role, page, limit: 25 }),
    [search, status, role, page]
  );

  const { data, error, loading, refetch } = useAdminQuery(adminApi.listUsers, params);

  const users = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      company: user.company || "",
      role: user.role || "member",
      status: user.status || "invited",
      plan: user.plan || "free",
      phone: user.phone || "",
      notes: user.notes || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (editing) {
        await adminApi.updateUser(editing._id, {
          name: form.name,
          company: form.company,
          role: form.role,
          status: form.status,
          plan: form.plan,
          phone: form.phone,
          notes: form.notes,
        });
      } else {
        await adminApi.createUser({
          name: form.name,
          email: form.email,
          company: form.company,
          role: form.role,
          status: form.status,
          plan: form.plan,
          phone: form.phone,
          notes: form.notes,
        });
      }
      closeModal();
      refetch();
    } catch (err) {
      setFormError(err?.message || "Could not save the user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete ${user.email}? This cannot be undone.`);
    if (!confirmed) return;

    setActionError("");
    try {
      await adminApi.deleteUser(user._id);
      refetch();
    } catch (err) {
      setActionError(err?.message || "Could not delete the user");
    }
  };

  const handleStatusToggle = async (user) => {
    setActionError("");
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    try {
      await adminApi.updateUser(user._id, { status: nextStatus });
      refetch();
    } catch (err) {
      setActionError(err?.message || "Could not update the user");
    }
  };

  return (
    <AdminShell
      title="Users"
      subtitle="Manage the people who use Docstools"
      requirePermission={PERMISSIONS.USERS_VIEW}
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
          {canManage ? (
            <button type="button" className="admin-button admin-button--sm" onClick={openCreate}>
              <Plus size={14} aria-hidden="true" />
              Add user
            </button>
          ) : null}
        </>
      }
    >
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-toolbar">
            <div className="admin-field">
              <label htmlFor="user-search">Search</label>
              <div className="admin-search-field">
                <Search size={14} aria-hidden="true" />
                <input
                  id="user-search"
                  type="search"
                  className="admin-input admin-input--search"
                  placeholder="Name, email or company"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="user-status">Status</label>
              <select
                id="user-status"
                className="admin-select"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="user-role">Role</label>
              <select
                id="user-role"
                className="admin-select"
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All roles</option>
                {ROLES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {actionError ? (
          <div className="admin-error admin-panel-message" role="alert">
            {actionError}
          </div>
        ) : null}

        {error ? (
          <div className="admin-error admin-panel-message" role="alert">
            {error.message || "Could not load users"}
          </div>
        ) : null}

        <div className="admin-panel-body admin-panel-body--flush">
          {loading && users.length === 0 ? (
            <div className="admin-empty">
              <p>Loading users…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="admin-empty">
              <UserCog size={28} aria-hidden="true" />
              <h3>No users found</h3>
              <p>Adjust the filters, or add your first user.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Last seen</th>
                    <th>Created</th>
                    {canManage ? <th className="actions">Actions</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-cell-primary">
                          <strong>{user.name}</strong>
                          <span className="admin-cell-muted">{user.email}</span>
                          {user.company ? (
                            <span className="admin-cell-muted">{user.company}</span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${user.role}`}>{user.role}</span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${user.plan}`}>{user.plan}</span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${user.status}`}>{user.status}</span>
                      </td>
                      <td className="admin-cell-muted">{formatRelative(user.lastSeenAt)}</td>
                      <td className="admin-cell-muted">{formatDate(user.createdAt)}</td>
                      {canManage ? (
                        <td className="actions">
                          <div className="admin-table-actions">
                            <button
                              type="button"
                              className="admin-button admin-button--ghost admin-button--sm"
                              onClick={() => openEdit(user)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="admin-button admin-button--ghost admin-button--sm"
                              onClick={() => handleStatusToggle(user)}
                              title={user.status === "suspended" ? "Reactivate user" : "Suspend user"}
                            >
                              {user.status === "suspended" ? "Reactivate" : "Suspend"}
                            </button>
                            <button
                              type="button"
                              className="admin-button admin-button--danger admin-button--icon"
                              onClick={() => handleDelete(user)}
                              aria-label={`Delete ${user.email}`}
                              title="Delete user"
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-pagination">
          <span>
            {pagination.total} user{pagination.total === 1 ? "" : "s"} · page {pagination.page} of{" "}
            {pagination.totalPages}
          </span>
          <div className="admin-pagination-actions">
            <button
              type="button"
              className="admin-button admin-button--ghost admin-button--sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={pagination.page <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost admin-button--sm"
              onClick={() => setPage((current) => current + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {modalOpen ? (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2 id="user-modal-title">{editing ? "Edit user" : "Add user"}</h2>
              <button
                type="button"
                className="admin-button admin-button--ghost admin-button--icon"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                {formError ? (
                  <div className="admin-error" role="alert">
                    {formError}
                  </div>
                ) : null}

                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label htmlFor="user-name">Full name</label>
                    <input
                      id="user-name"
                      className="admin-input"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="user-email">Email</label>
                    <input
                      id="user-email"
                      type="email"
                      className="admin-input"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      disabled={Boolean(editing)}
                      required
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="user-company">Company</label>
                    <input
                      id="user-company"
                      className="admin-input"
                      value={form.company}
                      onChange={(event) => setForm({ ...form, company: event.target.value })}
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="user-form-role">Role</label>
                    <select
                      id="user-form-role"
                      className="admin-select"
                      value={form.role}
                      onChange={(event) => setForm({ ...form, role: event.target.value })}
                    >
                      {ROLES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="user-form-status">Status</label>
                    <select
                      id="user-form-status"
                      className="admin-select"
                      value={form.status}
                      onChange={(event) => setForm({ ...form, status: event.target.value })}
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="user-form-plan">Plan</label>
                    <select
                      id="user-form-plan"
                      className="admin-select"
                      value={form.plan}
                      onChange={(event) => setForm({ ...form, plan: event.target.value })}
                    >
                      {PLANS.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="user-phone">Phone</label>
                    <input
                      id="user-phone"
                      className="admin-input"
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label htmlFor="user-notes">Notes</label>
                  <textarea
                    id="user-notes"
                    className="admin-input"
                    rows={3}
                    value={form.notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-button admin-button--ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-button" disabled={saving}>
                  {saving ? "Saving…" : editing ? "Save changes" : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
