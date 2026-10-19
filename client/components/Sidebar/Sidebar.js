"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  ChartNoAxesCombined,
  MonitorSmartphone,
  Users,
  MousePointerClick,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "./Sidebar.css";

const cn = (...classes) => classes.filter(Boolean).join("");

// Navigation items in the required order. All destinations exist as routes:
// Dashboard is the live analytics page; the rest are "Coming soon" pages.
const NAV_ITEMS = [
  { name: "Dashboard", href: "/kingdome/dashboard", icon: LayoutDashboard },
  { name: "Pages", href: "/kingdome/pages", icon: FileText },
  { name: "Traffic Sources", href: "/kingdome/traffic-sources", icon: ChartNoAxesCombined },
  { name: "Devices", href: "/kingdome/devices", icon: MonitorSmartphone },
  { name: "Live Visitors", href: "/kingdome/live-visitors", icon: Users },
  { name: "Events", href: "/kingdome/events", icon: MousePointerClick },
  { name: "Settings", href: "/kingdome/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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
    [pathname],
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
          <span className="sidebar-section-label">Navigation</span>
          <ul className="sidebar-list">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const comingSoon = item.href !== "/kingdome/dashboard";
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
                      <>
                        <span className="sidebar-item-label">{item.name}</span>
                        {comingSoon && (
                          <span className="sidebar-item-badge">Coming soon</span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
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
