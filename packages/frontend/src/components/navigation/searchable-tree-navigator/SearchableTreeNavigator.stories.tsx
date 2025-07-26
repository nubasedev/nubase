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
import { showToast } from "../../floating/toast";
import { SearchableTreeNavigator } from "./SearchableTreeNavigator";
import type { TreeNavigatorItem } from "./TreeNavigator";

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

// Flat structure items (no hierarchy) - using onNavigate callbacks
const flatItemsWithCallbacks: TreeNavigatorItem[] = [
  {
    id: "dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    title: "Go to Dashboard",
    subtitle: "View your main dashboard (onNavigate)",
    onNavigate: () => {
      showToast("Navigated to Dashboard", "default");
    },
  },
  {
    id: "create",
    icon: <Plus className="h-4 w-4" />,
    title: "Create New Item",
    subtitle: "Add a new item to your collection (onNavigate)",
    onNavigate: () => {
      showToast("Creating new item...", "default");
    },
  },
  {
    id: "settings",
    icon: <Settings className="h-4 w-4" />,
    title: "View Settings",
    subtitle: "Configure your preferences (onNavigate)",
    onNavigate: () => {
      showToast("Settings panel opened", "default");
    },
  },
];

// Flat structure items using href navigation
const flatItemsWithHrefs: TreeNavigatorItem[] = [
  {
    id: "dashboard-href",
    icon: <LayoutDashboard className="h-4 w-4" />,
    title: "Dashboard Page",
    subtitle: "Navigate to dashboard page (href)",
    href: "/dashboard",
  },
  {
    id: "docs-href",
    icon: <Book className="h-4 w-4" />,
    title: "Documentation",
    subtitle: "Read the documentation (href)",
    href: "/docs",
  },
  {
    id: "team-href",
    icon: <Users className="h-4 w-4" />,
    title: "Team Page",
    subtitle: "View team members (href)",
    href: "/team",
  },
  {
    id: "files-href",
    icon: <File className="h-4 w-4" />,
    title: "File Manager",
    subtitle: "Browse files (href)",
    href: "/files",
  },
];

// Mixed tree with both href and onNavigate navigation
const treeItemsMixed: TreeNavigatorItem[] = [
  {
    id: "dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    title: "Dashboard",
    subtitle: "Main application dashboard (href)",
    href: "/dashboard",
  },
  {
    id: "projects",
    icon: <Folder className="h-4 w-4" />,
    title: "Projects",
    subtitle: "Project management folder (expandable)",
    onNavigate: () => {
      showToast("Navigated to Projects", "default");
    },
    children: [
      {
        id: "project-1",
        icon: <File className="h-4 w-4" />,
        title: "Website Redesign",
        subtitle: "Frontend project (href)",
        href: "/projects/website-redesign",
      },
      {
        id: "project-2",
        icon: <File className="h-4 w-4" />,
        title: "Mobile App",
        subtitle: "React Native project (onNavigate)",
        onNavigate: () => {
          showToast("Opened Mobile App project", "default");
        },
      },
      {
        id: "project-3",
        icon: <Folder className="h-4 w-4" />,
        title: "Legacy Projects",
        subtitle: "Older projects (expandable)",
        children: [
          {
            id: "legacy-1",
            icon: <File className="h-4 w-4" />,
            title: "Old Website",
            subtitle: "Previous version (href)",
            href: "/projects/legacy/old-website",
          },
          {
            id: "legacy-2",
            icon: <File className="h-4 w-4" />,
            title: "Archive",
            subtitle: "Archived projects (onNavigate)",
            onNavigate: () => {
              showToast("Opened Archive", "default");
            },
          },
        ],
      },
    ],
  },
  {
    id: "team",
    icon: <Users className="h-4 w-4" />,
    title: "Team Management",
    subtitle: "Manage team members and roles",
    onNavigate: () => {
      showToast("Navigated to Team Management", "default");
    },
    children: [
      {
        id: "developers",
        icon: <Users className="h-4 w-4" />,
        title: "Developers",
        subtitle: "Development team members",
        onNavigate: () => {
          showToast("Opened Developers section", "default");
        },
      },
      {
        id: "designers",
        icon: <Users className="h-4 w-4" />,
        title: "Designers",
        subtitle: "Design team members",
        onNavigate: () => {
          showToast("Opened Designers section", "default");
        },
      },
    ],
  },
  {
    id: "settings",
    icon: <Settings className="h-4 w-4" />,
    title: "Settings",
    subtitle: "Application settings and preferences",
    onNavigate: () => {
      showToast("Navigated to Settings", "default");
    },
  },
];

// Stories for flat structure (no hierarchy)
export const FlatWithCallbacks: Story = {
  args: {
    items: flatItemsWithCallbacks,
    placeHolder: "Search actions (onNavigate)...",
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

const deepTreeItems: TreeNavigatorItem[] = [
  {
    id: "level1-1",
    icon: <Folder className="h-4 w-4" />,
    title: "Level 1 - Folder A",
    subtitle: "Top level folder",
    onNavigate: () => {
      showToast("Navigated to Level 1 - Folder A", "default");
    },
    children: [
      {
        id: "level2-1",
        icon: <Folder className="h-4 w-4" />,
        title: "Level 2 - Subfolder A1",
        subtitle: "Second level folder",
        onNavigate: () => {
          showToast("Navigated to Level 2 - Subfolder A1", "default");
        },
        children: [
          {
            id: "level3-1",
            icon: <Folder className="h-4 w-4" />,
            title: "Level 3 - Deep Folder",
            subtitle: "Third level folder",
            onNavigate: () => {
              showToast("Navigated to Level 3 - Deep Folder", "default");
            },
            children: [
              {
                id: "level4-1",
                icon: <File className="h-4 w-4" />,
                title: "Level 4 - Deep File",
                subtitle: "Fourth level file",
                onNavigate: () => {
                  showToast("Opened Level 4 - Deep File", "default");
                },
              },
            ],
          },
          {
            id: "level3-2",
            icon: <File className="h-4 w-4" />,
            title: "Level 3 - File",
            subtitle: "Third level file",
            onNavigate: () => {
              showToast("Opened Level 3 - File", "default");
            },
          },
        ],
      },
      {
        id: "level2-2",
        icon: <File className="h-4 w-4" />,
        title: "Level 2 - File A1",
        subtitle: "Second level file",
        onNavigate: () => {
          showToast("Opened Level 2 - File A1", "default");
        },
      },
    ],
  },
  {
    id: "level1-2",
    icon: <File className="h-4 w-4" />,
    title: "Level 1 - File B",
    subtitle: "Top level file",
    onNavigate: () => {
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
const generateManyItems = (count: number): TreeNavigatorItem[] => {
  const items: TreeNavigatorItem[] = [];

  for (let i = 1; i <= count; i++) {
    const hasChildren = i % 5 === 0;

    if (hasChildren) {
      items.push({
        id: `category-${i}`,
        icon: <Folder className="h-4 w-4" />,
        title: `Category ${i}`,
        subtitle: `${Math.floor(Math.random() * 50)} items`,
        children: Array.from(
          { length: Math.floor(Math.random() * 8) + 3 },
          (_, j) => ({
            id: `item-${i}-${j + 1}`,
            icon: <File className="h-4 w-4" />,
            title: `Item ${i}.${j + 1}`,
            subtitle: `Subcategory ${j + 1}`,
            onNavigate: () => showToast(`Opened Item ${i}.${j + 1}`),
          }),
        ),
      });
    } else {
      items.push({
        id: `item-${i}`,
        icon: <File className="h-4 w-4" />,
        title: `Navigation Item ${i}`,
        subtitle: `Description for item ${i}`,
        onNavigate: () => showToast(`Opened Item ${i}`),
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
