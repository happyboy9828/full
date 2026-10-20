import {
  LayoutDashboard,
  FileText,
  ChartNoAxesCombined,
  MonitorSmartphone,
  MousePointerClick,
  Radio,
  ScrollText,
  Server,
  Settings,
  UserCog,
  Users,
} from "lucide-react";

import { PERMISSIONS } from "./permissions";

/**
 * Admin navigation map.
 *
 * Each item declares the permission required to see it. The sidebar filters
 * the list against the signed-in admin's permission set, so a viewer never
 * sees a link that would 403.
 */

export const ADMIN_NAV_SECTIONS = [
  {
    label: "Analytics",
    items: [
      {
        name: "Dashboard",
        href: "/kingdome/dashboard",
        icon: LayoutDashboard,
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        name: "Pages",
        href: "/kingdome/pages",
        icon: FileText,
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
      {
        name: "Traffic Sources",
        href: "/kingdome/traffic-sources",
        icon: ChartNoAxesCombined,
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
      {
        name: "Devices",
        href: "/kingdome/devices",
        icon: MonitorSmartphone,
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
      {
        name: "Live Visitors",
        href: "/kingdome/live-visitors",
        icon: Radio,
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
      {
        name: "Events",
        href: "/kingdome/events",
        icon: MousePointerClick,
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        name: "Users",
        href: "/kingdome/users",
        icon: Users,
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        name: "Administrators",
        href: "/kingdome/admins",
        icon: UserCog,
        permission: PERMISSIONS.ADMINS_MANAGE,
      },
      {
        name: "Activity Log",
        href: "/kingdome/activity",
        icon: ScrollText,
        permission: PERMISSIONS.ACTIVITY_VIEW,
      },
      {
        name: "System",
        href: "/kingdome/system",
        icon: Server,
        permission: PERMISSIONS.SYSTEM_VIEW,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        name: "Settings",
        href: "/kingdome/settings",
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];

export function navItemsForPermissions(permissions = []) {
  const granted = new Set(permissions);
  return ADMIN_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || granted.has(item.permission)),
  })).filter((section) => section.items.length > 0);
}
