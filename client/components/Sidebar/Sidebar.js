"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { navItemsForPermissions } from "@/lib/adminNav";

import "./Sidebar.css";

const cn = (...classes) => classes.filter(Boolean).join("");

export default function Sidebar({ items, sections }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // RBAC-aware navigation: hide entries the signed-in admin cannot use.
  const { permissions } = useAuth();
  const resolvedSections = useMemo(() => {
    if (sections) return sections;
    if (items) return [{ label: "Navigation", items }];
    return navItemsForPermissions(permissions);
  }, [sections, items, permissions]);

  // Never leave the sidebar collapsed on desktop breakpoints.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setCollapsed(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isActive = useCallback(
    (href) => {
      if (!href) return false;
      // Exact match or nested route (e.g. /kingdome/dashboard/reports).
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname]
  );

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = () => setDrawerOpen((open) => !open);
  const toggleCollapse = () => setCollapsed((previous) => !previous);

  // Close the mobile drawer with Escape and stop body scroll while open.
  useEffect(() => {
    const onKeydown = (event) => {
      if (event.key === "Escape") closeDrawer();
    };
    if (drawerOpen) {
      document.addEventListener("keydown", onKeydown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeydown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className="sidebar-layout">
      {/* Mobile: hamburger opens the slide-in drawer. Hidden at tablet+. */}
      <button
        type="button"
        className="sidebar-hamburger"
        onClick={toggleDrawer}
        aria-expanded={drawerOpen}
        aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
      >
        {drawerOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
      </button>

      <aside
        className={cn("sidebar", drawerOpen ? "sidebar--open" : "", collapsed ? "sidebar--collapsed" : "")}
      >
        <div className="sidebar-brand">
          <Link href="/" className="sidebar-brand-link" aria-label="Docstools">
            <img src="/logo.jpeg" alt="" className="sidebar-brand-logo" />
            <span className="sidebar-brand-name">Docstools</span>
          </Link>
        </div>

        <div className="sidebar-divider" aria-hidden="true" />

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {resolvedSections.map((section) => (
            <div key={section.label} className="sidebar-section">
              <span className="sidebar-section-label">{section.label}</span>
              <ul className="sidebar-list">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.name} className="sidebar-list-item">
                      <Link
                        href={item.href}
                        className={cn("sidebar-item", active && "sidebar-item--active")}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.name : undefined}
                        onClick={closeDrawer}
                      >
                        <div className="sidebar-item-icon" aria-hidden="true">
                          <Icon size={20} strokeWidth={2} />
                        </div>
                        {!collapsed && (
                          <span className="sidebar-item-label">{item.name}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Tablet: collapse/expand toggle for icon-only navigation. */}
        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={toggleCollapse}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          title={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <ChevronRight size={18} strokeWidth={2} /> : <ChevronLeft size={18} strokeWidth={2} />}
        </button>
      </aside>

      {/* Mobile drawer backdrop. */}
      {drawerOpen && (
        <div
          className="sidebar-backdrop sidebar-backdrop--open"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
