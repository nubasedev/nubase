import type { NavItem } from "@nubase/core";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { MainNav } from "../components/main-nav/MainNav";

// Dummy navigation items for now
const dummyNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
  },
  {
    id: "resources",
    label: "Resources",
    children: [
      {
        id: "contacts",
        label: "Contacts",
        href: "/r/contacts",
        badge: "12",
      },
      {
        id: "projects",
        label: "Projects",
        href: "/r/projects",
      },
      {
        id: "documents",
        label: "Documents",
        href: "/r/documents",
        badge: "NEW",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    children: [
      {
        id: "reports",
        label: "Reports",
        href: "/analytics/reports",
      },
      {
        id: "insights",
        label: "Insights",
        href: "/analytics/insights",
      },
      {
        id: "metrics",
        label: "Metrics",
        href: "/analytics/metrics",
      },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    children: [
      {
        id: "integrations",
        label: "Integrations",
        href: "/tools/integrations",
      },
      {
        id: "api",
        label: "API Explorer",
        href: "/tools/api",
      },
      {
        id: "webhooks",
        label: "Webhooks",
        href: "/tools/webhooks",
        badge: "3",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    children: [
      {
        id: "profile",
        label: "Profile",
        href: "/settings/profile",
      },
      {
        id: "team",
        label: "Team",
        href: "/settings/team",
      },
      {
        id: "billing",
        label: "Billing",
        href: "/settings/billing",
      },
      {
        id: "security",
        label: "Security",
        href: "/settings/security",
      },
    ],
  },
  {
    id: "about",
    label: "About",
    href: "/about",
  },
];

function RootComponent() {
  // Set dark mode on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="flex h-screen">
        {/* Sidebar Navigation */}
        <MainNav items={dummyNavItems} width="md" />

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
