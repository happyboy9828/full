"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";

import { useAuth } from "@/components/AuthProvider/AuthProvider";
import "@/components/AdminShell/AdminShell.css";

/**
 * Sticky top header for the admin area.
 *
 * Contains the page title, a global search affordance, a notification
 * indicator and the user profile menu (identity, role and sign-out).
 */

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AdminHeader({ title, subtitle, actions }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close the profile menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onPointerDown = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        closeMenu();
      }
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeydown);
    };
  }, [menuOpen, closeMenu]);

  const handleLogout = useCallback(async () => {
    closeMenu();
    await logout();
    router.push("/kingdome/login");
    router.refresh();
  }, [closeMenu, logout, router]);

  return (
    <header className="admin-header">
      <div className="admin-header-identity">
        {title ? <h1 className="admin-header-title">{title}</h1> : null}
        {subtitle ? <p className="admin-header-subtitle">{subtitle}</p> : null}
      </div>

      <div className="admin-header-actions">
        {actions}

        <div className={`admin-search${searchOpen ? " admin-search--open" : ""}`}>
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search"
            aria-label="Search the dashboard"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
        </div>

        <button type="button" className="admin-icon-button" aria-label="Notifications" title="Notifications">
          <Bell size={18} strokeWidth={2} />
          <span className="admin-notification-dot" aria-hidden="true" />
        </button>

        <div className="admin-profile" ref={menuRef}>
          <button
            type="button"
            ref={buttonRef}
            className="admin-profile-trigger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="admin-avatar" aria-hidden="true">
              {initials(user?.name || user?.email)}
            </span>
            <span className="admin-profile-meta">
              <span className="admin-profile-name">{user?.name || user?.email || "Guest"}</span>
              <span className="admin-profile-role">{user?.roleLabel || "—"}</span>
            </span>
            <ChevronDown size={16} className="admin-profile-chevron" aria-hidden="true" />
          </button>

          {menuOpen && (
            <div className="admin-profile-menu" role="menu">
              <div className="admin-profile-menu-header">
                <span className="admin-avatar admin-avatar--lg" aria-hidden="true">
                  {initials(user?.name || user?.email)}
                </span>
                <div className="admin-profile-menu-identity">
                  <strong>{user?.name || "Guest"}</strong>
                  <span className="admin-profile-menu-email">{user?.email}</span>
                  {user?.role ? (
                    <span className={`admin-role-badge admin-role-badge--${user.role}`}>
                      <ShieldCheck size={12} aria-hidden="true" />
                      {user.roleLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="admin-profile-menu-actions">
                <Link
                  href="/kingdome/settings"
                  className="admin-profile-menu-item"
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <User size={16} aria-hidden="true" />
                  Profile &amp; security
                </Link>
                <button
                  type="button"
                  className="admin-profile-menu-item admin-profile-menu-item--danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut size={16} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
