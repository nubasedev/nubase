import type { Meta, StoryObj } from "@storybook/react";
import {
  ChevronRight,
  Folder,
  Home,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import type { MenuItem } from "../../../menu/types";
import { Dock } from "../../dock/Dock";
import { MainNav } from "./MainNav";

const meta: Meta<typeof MainNav> = {
  title: "Navigation/MainNav",
  component: MainNav,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    items: {
      control: { type: "object" },
    },
    searchPlaceholder: {
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample navigation data
const sampleNavItems: MenuItem[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    id: "projects",
    icon: Folder,
    label: "Projects",
    children: [
      {
        id: "project-1",
        icon: Folder,
        label: "Project Alpha",
        subtitle: "Active project",
        href: "/projects/alpha",
      },
      {
        id: "project-2",
        icon: Folder,
        label: "Project Beta",
        subtitle: "3 tasks pending",
        href: "/projects/beta",
      },
      {
        id: "project-3",
        icon: Folder,
        label: "Project Gamma",
        subtitle: "Archived",
        href: "/projects/gamma",
      },
    ],
  },
  {
    id: "team",
    icon: Users,
    label: "Team",
    children: [
      {
        id: "members",
        icon: Users,
        label: "Members",
        subtitle: "12 active members",
        href: "/team/members",
      },
      {
        id: "roles",
        icon: Settings,
        label: "Roles & Permissions",
        href: "/team/roles",
      },
      {
        id: "departments",
        icon: Folder,
        label: "Departments",
        children: [
          {
            id: "engineering",
            icon: Folder,
            label: "Engineering",
            subtitle: "8 developers",
            href: "/team/departments/engineering",
          },
          {
            id: "design",
            icon: Folder,
            label: "Design",
            subtitle: "3 designers",
            href: "/team/departments/design",
          },
          {
            id: "product",
            icon: Folder,
            label: "Product",
            subtitle: "2 managers",
            href: "/team/departments/product",
          },
        ],
      },
    ],
  },
  {
    id: "analytics",
    icon: LayoutDashboard,
    label: "Analytics",
    children: [
      {
        id: "reports",
        icon: LayoutDashboard,
        label: "Reports",
        href: "/analytics/reports",
      },
      {
        id: "insights",
        icon: LayoutDashboard,
        label: "Insights",
        href: "/analytics/insights",
      },
    ],
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    children: [
      {
        id: "general",
        icon: Settings,
        label: "General",
        href: "/settings/general",
      },
      {
        id: "integrations",
        icon: Settings,
        label: "Integrations",
        subtitle: "New features available",
        href: "/settings/integrations",
      },
      {
        id: "billing",
        icon: Settings,
        label: "Billing",
        href: "/settings/billing",
      },
    ],
  },
];

const minimalNavItems: MenuItem[] = [
  {
    id: "home",
    icon: Home,
    label: "Home",
    href: "/home",
  },
  {
    id: "about",
    icon: Home,
    label: "About",
    href: "/about",
  },
  {
    id: "contact",
    icon: Home,
    label: "Contact",
    href: "/contact",
  },
];

const deepNavItems: MenuItem[] = [
  {
    id: "level1",
    icon: Folder,
    label: "Level 1",
    children: [
      {
        id: "level2",
        icon: Folder,
        label: "Level 2",
        children: [
          {
            id: "level3",
            icon: Folder,
            label: "Level 3",
            children: [
              {
                id: "level4",
                icon: Folder,
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

// Generate many items for scroll testing
const generateManyItems = (count: number): MenuItem[] => {
  const items: MenuItem[] = [];

  for (let i = 1; i <= count; i++) {
    const hasChildren = i % 5 === 0; // Every 5th item has children

    if (hasChildren) {
      items.push({
        id: `category-${i}`,
        icon: Folder,
        label: `Category ${i}`,
        subtitle: `${Math.floor(Math.random() * 50)} items`,
        children: Array.from(
          { length: Math.floor(Math.random() * 8) + 3 },
          (_, j) => ({
            id: `item-${i}-${j + 1}`,
            icon: ChevronRight,
            label: `Item ${i}.${j + 1}`,
            subtitle: `Subcategory ${j + 1}`,
            href: `/category/${i}/item/${j + 1}`,
          }),
        ),
      });
    } else {
      items.push({
        id: `item-${i}`,
        icon: Home,
        label: `Navigation Item ${i}`,
        subtitle: `Description for item ${i}`,
        href: `/item/${i}`,
      });
    }
  }

  return items;
};

const manyNavItems = generateManyItems(100);

export const Default: Story = {
  args: {
    items: sampleNavItems,
  },
  decorators: [
    (Story) => (
      <Dock
        center={
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Main Content Area</h1>
            <p className="text-muted-foreground">
              This is the main content area. The navigation is on the left side.
            </p>
          </div>
        }
        left={<Story />}
      />
    ),
  ],
};

export const WithManyItems: Story = {
  args: {
    items: manyNavItems,
    searchPlaceholder: "Search through 100+ items...",
  },
  decorators: [
    (Story) => (
      <Dock
        center={
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">
              Many Items - Scroll Testing
            </h1>
            <p className="text-muted-foreground">
              This story contains 100+ dynamically generated navigation items to
              test scrolling performance and behavior. Every 5th item has
              expandable children. Try searching to test filtering performance.
            </p>
          </div>
        }
        left={<Story />}
      />
    ),
  ],
};

export const MinimalNavigation: Story = {
  args: {
    items: minimalNavItems,
  },
  decorators: [
    (Story) => (
      <Dock
        center={
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Minimal Navigation</h1>
            <p className="text-muted-foreground">
              Simple navigation with only leaf items.
            </p>
          </div>
        }
        left={<Story />}
      />
    ),
  ],
};

export const DeepNesting: Story = {
  args: {
    items: deepNavItems,
  },
  decorators: [
    (Story) => (
      <Dock
        center={
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Deep Nesting</h1>
            <p className="text-muted-foreground">
              Navigation with multiple levels of nesting.
            </p>
          </div>
        }
        left={<Story />}
      />
    ),
  ],
};

export const Empty: Story = {
  args: {
    items: [],
  },
  decorators: [
    (Story) => (
      <Dock
        center={
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Empty Navigation</h1>
            <p className="text-muted-foreground">
              Shows how the component handles an empty navigation array.
            </p>
          </div>
        }
        left={<Story />}
      />
    ),
  ],
};
