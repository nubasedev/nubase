import type { Meta, StoryObj } from "@storybook/react";
import {
  IconChevronRight,
  IconDashboard,
  IconFolder,
  IconHome,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { Dock } from "../../dock/Dock";
import type { TreeNavigatorItem } from "../searchable-tree-navigator/TreeNavigatorItem";
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
const sampleNavItems: TreeNavigatorItem[] = [
  {
    id: "dashboard",
    icon: <IconDashboard size={16} />,
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    id: "projects",
    icon: <IconFolder size={16} />,
    title: "Projects",
    children: [
      {
        id: "project-1",
        icon: <IconFolder size={16} />,
        title: "Project Alpha",
        subtitle: "Active project",
        href: "/projects/alpha",
      },
      {
        id: "project-2",
        icon: <IconFolder size={16} />,
        title: "Project Beta",
        subtitle: "3 tasks pending",
        href: "/projects/beta",
      },
      {
        id: "project-3",
        icon: <IconFolder size={16} />,
        title: "Project Gamma",
        subtitle: "Archived",
        href: "/projects/gamma",
      },
    ],
  },
  {
    id: "team",
    icon: <IconUsers size={16} />,
    title: "Team",
    children: [
      {
        id: "members",
        icon: <IconUsers size={16} />,
        title: "Members",
        subtitle: "12 active members",
        href: "/team/members",
      },
      {
        id: "roles",
        icon: <IconSettings size={16} />,
        title: "Roles & Permissions",
        href: "/team/roles",
      },
      {
        id: "departments",
        icon: <IconFolder size={16} />,
        title: "Departments",
        children: [
          {
            id: "engineering",
            icon: <IconFolder size={16} />,
            title: "Engineering",
            subtitle: "8 developers",
            href: "/team/departments/engineering",
          },
          {
            id: "design",
            icon: <IconFolder size={16} />,
            title: "Design",
            subtitle: "3 designers",
            href: "/team/departments/design",
          },
          {
            id: "product",
            icon: <IconFolder size={16} />,
            title: "Product",
            subtitle: "2 managers",
            href: "/team/departments/product",
          },
        ],
      },
    ],
  },
  {
    id: "analytics",
    icon: <IconDashboard size={16} />,
    title: "Analytics",
    children: [
      {
        id: "reports",
        icon: <IconDashboard size={16} />,
        title: "Reports",
        href: "/analytics/reports",
      },
      {
        id: "insights",
        icon: <IconDashboard size={16} />,
        title: "Insights",
        href: "/analytics/insights",
      },
    ],
  },
  {
    id: "settings",
    icon: <IconSettings size={16} />,
    title: "Settings",
    children: [
      {
        id: "general",
        icon: <IconSettings size={16} />,
        title: "General",
        href: "/settings/general",
      },
      {
        id: "integrations",
        icon: <IconSettings size={16} />,
        title: "Integrations",
        subtitle: "New features available",
        href: "/settings/integrations",
      },
      {
        id: "billing",
        icon: <IconSettings size={16} />,
        title: "Billing",
        href: "/settings/billing",
      },
    ],
  },
];

const minimalNavItems: TreeNavigatorItem[] = [
  {
    id: "home",
    icon: <IconHome size={16} />,
    title: "Home",
    href: "/home",
  },
  {
    id: "about",
    icon: <IconHome size={16} />,
    title: "About",
    href: "/about",
  },
  {
    id: "contact",
    icon: <IconHome size={16} />,
    title: "Contact",
    href: "/contact",
  },
];

const deepNavItems: TreeNavigatorItem[] = [
  {
    id: "level1",
    icon: <IconFolder size={16} />,
    title: "Level 1",
    children: [
      {
        id: "level2",
        icon: <IconFolder size={16} />,
        title: "Level 2",
        children: [
          {
            id: "level3",
            icon: <IconFolder size={16} />,
            title: "Level 3",
            children: [
              {
                id: "level4",
                icon: <IconFolder size={16} />,
                title: "Level 4 Item",
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
const generateManyItems = (count: number): TreeNavigatorItem[] => {
  const items: TreeNavigatorItem[] = [];

  for (let i = 1; i <= count; i++) {
    const hasChildren = i % 5 === 0; // Every 5th item has children

    if (hasChildren) {
      items.push({
        id: `category-${i}`,
        icon: <IconFolder size={16} />,
        title: `Category ${i}`,
        subtitle: `${Math.floor(Math.random() * 50)} items`,
        children: Array.from(
          { length: Math.floor(Math.random() * 8) + 3 },
          (_, j) => ({
            id: `item-${i}-${j + 1}`,
            icon: <IconChevronRight size={16} />,
            title: `Item ${i}.${j + 1}`,
            subtitle: `Subcategory ${j + 1}`,
            href: `/category/${i}/item/${j + 1}`,
          }),
        ),
      });
    } else {
      items.push({
        id: `item-${i}`,
        icon: <IconHome size={16} />,
        title: `Navigation Item ${i}`,
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
