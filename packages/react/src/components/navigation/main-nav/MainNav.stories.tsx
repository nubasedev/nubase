import type { NavItem } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MainNav } from "./MainNav";

const meta: Meta<typeof MainNav> = {
  title: "Navigation/MainNav",
  component: MainNav,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    width: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    items: {
      control: { type: "object" },
    },
    searchPlaceholder: {
      control: { type: "text" },
    },
    activeItemId: {
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample navigation data
const sampleNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    id: "projects",
    label: "Projects",
    children: [
      {
        id: "project-1",
        label: "Project Alpha",
        href: "/projects/alpha",
      },
      {
        id: "project-2",
        label: "Project Beta",
        href: "/projects/beta",
        badge: "3",
      },
      {
        id: "project-3",
        label: "Project Gamma",
        href: "/projects/gamma",
        disabled: true,
      },
    ],
  },
  {
    id: "team",
    label: "Team",
    children: [
      {
        id: "members",
        label: "Members",
        href: "/team/members",
        badge: "12",
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        href: "/team/roles",
      },
      {
        id: "departments",
        label: "Departments",
        children: [
          {
            id: "engineering",
            label: "Engineering",
            href: "/team/departments/engineering",
          },
          {
            id: "design",
            label: "Design",
            href: "/team/departments/design",
          },
          {
            id: "product",
            label: "Product",
            href: "/team/departments/product",
          },
        ],
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
    ],
  },
  {
    id: "settings",
    label: "Settings",
    children: [
      {
        id: "general",
        label: "General",
        href: "/settings/general",
      },
      {
        id: "integrations",
        label: "Integrations",
        href: "/settings/integrations",
        badge: "NEW",
      },
      {
        id: "billing",
        label: "Billing",
        href: "/settings/billing",
      },
    ],
  },
];

const minimalNavItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/home",
  },
  {
    id: "about",
    label: "About",
    href: "/about",
  },
  {
    id: "contact",
    label: "Contact",
    href: "/contact",
  },
];

const deepNavItems: NavItem[] = [
  {
    id: "level1",
    label: "Level 1",
    children: [
      {
        id: "level2",
        label: "Level 2",
        children: [
          {
            id: "level3",
            label: "Level 3",
            children: [
              {
                id: "level4",
                label: "Level 4 Item",
                href: "/deep/item",
              },
            ],
          },
        ],
      },
    ],
  },
];

export const Default: Story = {
  args: {
    items: sampleNavItems,
    width: "md",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <div className="flex-1 p-8 bg-background">
          <h1 className="text-2xl font-bold mb-4">Main Content Area</h1>
          <p className="text-text-muted">
            This is the main content area. The navigation is on the left side.
          </p>
        </div>
      </div>
    ),
  ],
};

export const WithActiveItem: Story = {
  args: {
    items: sampleNavItems,
    width: "md",
    activeItemId: "project-1",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <div className="flex-1 p-8 bg-background">
          <h1 className="text-2xl font-bold mb-4">Project Alpha</h1>
          <p className="text-text-muted">
            The "Project Alpha" item is highlighted as active.
          </p>
        </div>
      </div>
    ),
  ],
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 h-screen">
      <MainNav items={minimalNavItems} width="sm" />
      <MainNav items={minimalNavItems} width="md" />
      <MainNav items={minimalNavItems} width="lg" />
    </div>
  ),
};

export const MinimalNavigation: Story = {
  args: {
    items: minimalNavItems,
    width: "sm",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <div className="flex-1 p-8 bg-background">
          <h1 className="text-2xl font-bold mb-4">Minimal Navigation</h1>
          <p className="text-text-muted">
            Simple navigation with only leaf items.
          </p>
        </div>
      </div>
    ),
  ],
};

export const DeepNesting: Story = {
  args: {
    items: deepNavItems,
    width: "md",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <div className="flex-1 p-8 bg-background">
          <h1 className="text-2xl font-bold mb-4">Deep Nesting</h1>
          <p className="text-text-muted">
            Navigation with multiple levels of nesting.
          </p>
        </div>
      </div>
    ),
  ],
};

export const WithSearchFiltering: Story = {
  args: {
    items: sampleNavItems,
    width: "md",
    searchPlaceholder: "Search for features...",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <div className="flex-1 p-8 bg-background">
          <h1 className="text-2xl font-bold mb-4">Search Filtering</h1>
          <p className="text-text-muted">
            Try searching for "project", "team", or "analytics" to see the
            filtering in action.
          </p>
        </div>
      </div>
    ),
  ],
};

export const ControlledState: Story = {
  render: () => {
    const [activeItemId, setActiveItemId] = useState<string>("dashboard");
    const [expandedItems, setExpandedItems] = useState<string[]>([
      "projects",
      "team",
    ]);

    return (
      <div className="flex h-screen">
        <MainNav
          items={sampleNavItems}
          width="md"
          activeItemId={activeItemId}
          expandedItems={expandedItems}
          onExpandedChange={setExpandedItems}
        />
        <div className="flex-1 p-8 bg-background">
          <h1 className="text-2xl font-bold mb-4">Controlled State</h1>
          <p className="text-text-muted mb-4">
            This example shows controlled state management.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Active Item:</h3>
              <p className="text-sm text-text-muted">{activeItemId}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Expanded Items:</h3>
              <p className="text-sm text-text-muted">
                {expandedItems.join(", ") || "None"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Quick Actions:</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveItemId("project-1")}
                  className="px-3 py-1 bg-primary text-white rounded text-sm"
                >
                  Set Active: Project Alpha
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedItems(["projects", "team", "settings"])
                  }
                  className="px-3 py-1 bg-secondary text-white rounded text-sm"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedItems([])}
                  className="px-3 py-1 bg-surface border border-border rounded text-sm"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const WithClickHandlers: Story = {
  args: {
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        onClick: () => alert("Dashboard clicked!"),
      },
      {
        id: "tools",
        label: "Tools",
        children: [
          {
            id: "calculator",
            label: "Calculator",
            onClick: () => alert("Calculator clicked!"),
          },
          {
            id: "editor",
            label: "Text Editor",
            onClick: () => alert("Text Editor clicked!"),
          },
        ],
      },
    ],
    width: "md",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <div className="flex-1 p-8 bg-background">
          <h1 className="text-2xl font-bold mb-4">Click Handlers</h1>
          <p className="text-text-muted">
            Click on navigation items to see the onClick handlers in action.
          </p>
        </div>
      </div>
    ),
  ],
};

export const DarkMode: Story = {
  args: {
    items: sampleNavItems,
    width: "md",
    activeItemId: "dashboard",
  },
  decorators: [
    (Story) => (
      <div data-theme="dark" className="flex h-screen bg-background">
        <Story />
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-4">Dark Mode</h1>
          <p className="text-text-muted">
            The navigation adapts to dark mode using the theme system.
          </p>
        </div>
      </div>
    ),
  ],
};

export const Empty: Story = {
  args: {
    items: [],
    width: "md",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <div className="flex-1 p-8 bg-background">
          <h1 className="text-2xl font-bold mb-4">Empty Navigation</h1>
          <p className="text-text-muted">
            Shows how the component handles an empty navigation array.
          </p>
        </div>
      </div>
    ),
  ],
};
