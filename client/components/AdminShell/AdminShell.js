"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import Sidebar from "@/components/Sidebar/Sidebar";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import { useAuth } from "@/components/AuthProvider/AuthProvider";

import "./AdminShell.css";

/**
 * Admin application shell.
 *
 * Layout: fixed sidebar (left) + sticky top header + scrollable main area.
 *
 * It also acts as the client-side access gate:
 *  - not signed in  -> redirect to the login page (with a return path)
 *  - missing the page permission -> a 403 panel instead of the content
 *
 * The server re-checks every permission; this only avoids rendering UI the
 * signed-in admin could not use.
 */
export default function AdminShell({
  title,
  subtitle,
  actions,
  children,
  requirePermission,
}) {
  const { authenticated, loading, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !authenticated) {
      const redirect = pathname ? `/kingdome/login?redirect=${encodeURIComponent(pathname)}` : "/kingdome/login";
      router.replace(redirect);
    }
  }, [loading, authenticated, pathname, router]);

  if (loading) {
    return (
      <div className="admin-gate">
        <div className="admin-loading">
          <span className="loading-spinner" aria-hidden="true" />
          <p>Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-gate">
        <div className="admin-loading">
          <p>Redirecting to sign in…</p>
        </div>
      </div>
    );
  }

  const forbidden = requirePermission && !hasPermission(requirePermission);

  return (
    <div className="dashboard-layout admin-layout">
      <Sidebar />
      <div className="dashboard-main admin-main">
        <AdminHeader title={title} subtitle={subtitle} actions={actions} />
        <div className="admin-content">
          {forbidden ? (
            <div className="admin-panel admin-forbidden">
              <ShieldAlert size={32} aria-hidden="true" />
              <h2>Access denied</h2>
              <p>
                Your role does not include the <code>{requirePermission}</code> permission.
                Ask a super admin if you believe this is a mistake.
              </p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
