import type { Meta, StoryObj } from "@storybook/react";
import {
  Book,
  File,
  Folder,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import type { MenuItem } from "../../../menu/types";
import { showToast } from "../../floating/toast";
import { SearchableTreeNavigator } from "./SearchableTreeNavigator";

const meta: Meta<typeof SearchableTreeNavigator> = {
  title: "Navigation/SearchableTreeNavigator",
  component: SearchableTreeNavigator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Flat structure items (no hierarchy) - using onExecute callbacks
const flatItemsWithCallbacks: MenuItem[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Go to Dashboard",
    subtitle: "View your main dashboard (onExecute)",
    onExecute: () => {
      showToast("Navigated to Dashboard", "default");
    },
  },
  {
    id: "create",
    icon: Plus,
    label: "Create New Item",
    subtitle: "Add a new item to your collection (onExecute)",
    onExecute: () => {
      showToast("Creating new item...", "default");
    },
  },
  {
    id: "settings",
    icon: Settings,
    label: "View Settings",
    subtitle: "Configure your preferences (onExecute)",
    onExecute: () => {
      showToast("Settings panel opened", "default");
    },
  },
];

// Flat structure items using href navigation
const flatItemsWithHrefs: MenuItem[] = [
  {
    id: "dashboard-href",
    icon: LayoutDashboard,
    label: "Dashboard Page",
    subtitle: "Navigate to dashboard page (href)",
    href: "/dashboard",
  },
  {
    id: "docs-href",
    icon: Book,
    label: "Documentation",
    subtitle: "Read the documentation (href)",
    href: "/docs",
  },
  {
    id: "team-href",
    icon: Users,
    label: "Team Page",
    subtitle: "View team members (href)",
    href: "/team",
  },
  {
    id: "files-href",
    icon: File,
    label: "File Manager",
    subtitle: "Browse files (href)",
    href: "/files",
  },
];

// Mixed tree with both href and onExecute navigation
const treeItemsMixed: MenuItem[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    subtitle: "Main application dashboard (href)",
    href: "/dashboard",
  },
  {
    id: "projects",
    icon: Folder,
    label: "Projects",
    subtitle: "Project management folder (expandable)",
    onExecute: () => {
      showToast("Navigated to Projects", "default");
    },
    children: [
      {
        id: "project-1",
        icon: File,
        label: "Website Redesign",
        subtitle: "Frontend project (href)",
        href: "/projects/website-redesign",
      },
      {
        id: "project-2",
        icon: File,
        label: "Mobile App",
        subtitle: "React Native project (onExecute)",
        onExecute: () => {
          showToast("Opened Mobile App project", "default");
        },
      },
      {
        id: "project-3",
        icon: Folder,
        label: "Legacy Projects",
        subtitle: "Older projects (expandable)",
        children: [
          {
            id: "legacy-1",
            icon: File,
            label: "Old Website",
            subtitle: "Previous version (href)",
            href: "/projects/legacy/old-website",
          },
          {
            id: "legacy-2",
            icon: File,
            label: "Archive",
            subtitle: "Archived projects (onExecute)",
            onExecute: () => {
              showToast("Opened Archive", "default");
            },
          },
        ],
      },
    ],
  },
  {
    id: "team",
    icon: Users,
    label: "Team Management",
    subtitle: "Manage team members and roles",
    onExecute: () => {
      showToast("Navigated to Team Management", "default");
    },
    children: [
      {
        id: "developers",
        icon: Users,
        label: "Developers",
        subtitle: "Development team members",
        onExecute: () => {
          showToast("Opened Developers section", "default");
        },
      },
      {
        id: "designers",
        icon: Users,
        label: "Designers",
        subtitle: "Design team members",
        onExecute: () => {
          showToast("Opened Designers section", "default");
        },
      },
    ],
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    subtitle: "Application settings and preferences",
    onExecute: () => {
      showToast("Navigated to Settings", "default");
    },
  },
];

// Stories for flat structure (no hierarchy)
export const FlatWithCallbacks: Story = {
  args: {
    items: flatItemsWithCallbacks,
    placeHolder: "Search actions (onExecute)...",
  },
};

export const FlatWithHrefs: Story = {
  args: {
    items: flatItemsWithHrefs,
    placeHolder: "Search pages (href)...",
  },
};

// Stories for tree structure (with hierarchy)
export const TreeStructureMixed: Story = {
  args: {
    items: treeItemsMixed,
    placeHolder: "Search mixed navigation...",
  },
};

const deepTreeItems: MenuItem[] = [
  {
    id: "level1-1",
    icon: Folder,
    label: "Level 1 - Folder A",
    subtitle: "Top level folder",
    onExecute: () => {
      showToast("Navigated to Level 1 - Folder A", "default");
    },
    children: [
      {
        id: "level2-1",
        icon: Folder,
        label: "Level 2 - Subfolder A1",
        subtitle: "Second level folder",
        onExecute: () => {
          showToast("Navigated to Level 2 - Subfolder A1", "default");
        },
        children: [
          {
            id: "level3-1",
            icon: Folder,
            label: "Level 3 - Deep Folder",
            subtitle: "Third level folder",
            onExecute: () => {
              showToast("Navigated to Level 3 - Deep Folder", "default");
            },
            children: [
              {
                id: "level4-1",
                icon: File,
                label: "Level 4 - Deep File",
                subtitle: "Fourth level file",
                onExecute: () => {
                  showToast("Opened Level 4 - Deep File", "default");
                },
              },
            ],
          },
          {
            id: "level3-2",
            icon: File,
            label: "Level 3 - File",
            subtitle: "Third level file",
            onExecute: () => {
              showToast("Opened Level 3 - File", "default");
            },
          },
        ],
      },
      {
        id: "level2-2",
        icon: File,
        label: "Level 2 - File A1",
        subtitle: "Second level file",
        onExecute: () => {
          showToast("Opened Level 2 - File A1", "default");
        },
      },
    ],
  },
  {
    id: "level1-2",
    icon: File,
    label: "Level 1 - File B",
    subtitle: "Top level file",
    onExecute: () => {
      showToast("Opened Level 1 - File B", "default");
    },
  },
];

export const TreeStructureDeepNesting: Story = {
  args: {
    items: deepTreeItems,
    placeHolder: "Search deep tree...",
  },
};

export const EmptyState: Story = {
  args: {
    items: [],
    placeHolder: "No items available...",
  },
};

// Height prop demonstrations
export const WithFixedHeight: Story = {
  args: {
    items: treeItemsMixed,
    placeHolder: "Search in fixed height...",
    height: 300,
  },
};

export const WithFullHeight: Story = {
  args: {
    items: treeItemsMixed,
    placeHolder: "Search with full height...",
    height: "full",
  },
};

export const WithStringHeight: Story = {
  args: {
    items: treeItemsMixed,
    placeHolder: "Search with viewport height...",
    height: "50vh",
  },
};

// Generate many items for scroll testing with height
const generateManyItems = (count: number): MenuItem[] => {
  const items: MenuItem[] = [];

  for (let i = 1; i <= count; i++) {
    const hasChildren = i % 5 === 0;

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
            icon: File,
            label: `Item ${i}.${j + 1}`,
            subtitle: `Subcategory ${j + 1}`,
            onExecute: () => {
              showToast(`Opened Item ${i}.${j + 1}`);
            },
          }),
        ),
      });
    } else {
      items.push({
        id: `item-${i}`,
        icon: File,
        label: `Navigation Item ${i}`,
        subtitle: `Description for item ${i}`,
        onExecute: () => {
          showToast(`Opened Item ${i}`);
        },
      });
    }
  }

  return items;
};

export const ScrollTestWithHeight: Story = {
  args: {
    items: generateManyItems(100),
    placeHolder: "Search through 100+ items...",
    height: 400,
  },
};
