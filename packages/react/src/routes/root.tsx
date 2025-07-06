import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { MainNav } from "src/components/MainNav/MainNav";
import type { NavItem } from "src/config/types";
import { useNubaseConfig } from "src/config/NubaseConfigContext";

// Dummy navigation items for now
const dummyNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "📊",
    href: "/",
  },
  {
    id: "resources",
    label: "Resources",
    icon: "📁",
    children: [
      {
        id: "contacts",
        label: "Contacts",
        icon: "👥",
        href: "/r/contacts",
        badge: "12",
      },
      {
        id: "projects",
        label: "Projects",
        icon: "🚀",
        href: "/r/projects",
      },
      {
        id: "documents",
        label: "Documents",
        icon: "📄",
        href: "/r/documents",
        badge: "NEW",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📈",
    children: [
      {
        id: "reports",
        label: "Reports",
        icon: "📋",
        href: "/analytics/reports",
      },
      {
        id: "insights",
        label: "Insights",
        icon: "💡",
        href: "/analytics/insights",
      },
      {
        id: "metrics",
        label: "Metrics",
        icon: "📊",
        href: "/analytics/metrics",
      },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    icon: "🔧",
    children: [
      {
        id: "integrations",
        label: "Integrations",
        icon: "🔗",
        href: "/tools/integrations",
      },
      {
        id: "api",
        label: "API Explorer",
        icon: "⚡",
        href: "/tools/api",
      },
      {
        id: "webhooks",
        label: "Webhooks",
        icon: "🪝",
        href: "/tools/webhooks",
        badge: "3",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙️",
    children: [
      {
        id: "profile",
        label: "Profile",
        icon: "👤",
        href: "/settings/profile",
      },
      {
        id: "team",
        label: "Team",
        icon: "👥",
        href: "/settings/team",
      },
      {
        id: "billing",
        label: "Billing",
        icon: "💳",
        href: "/settings/billing",
      },
      {
        id: "security",
        label: "Security",
        icon: "🔒",
        href: "/settings/security",
      },
    ],
  },
  {
    id: "about",
    label: "About",
    icon: "ℹ️",
    href: "/about",
  },
];

function RootComponent() {
  const config = useNubaseConfig();

  // Set dark mode on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="flex h-screen">
        {/* Sidebar Navigation */}
        <MainNav
          items={dummyNavItems}
          width="md"
          searchPlaceholder="Search navigation..."
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Development Tools */}
      <TanStackRouterDevtools />
    </div>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
});
