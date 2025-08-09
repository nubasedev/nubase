import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DynamicIcon, getAvailableIconNames } from "./DynamicIcon";

const meta: Meta<typeof DynamicIcon> = {
  title: "Icons/DynamicIcon",
  component: DynamicIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: { type: "text" },
      description:
        "Icon name (Lucide format: 'Rocket', 'Mail' or Tabler format: 'IconRocket', 'IconMail' for backwards compatibility)",
    },
    size: {
      control: { type: "number" },
      defaultValue: 16,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Rocket",
    size: 24,
  },
};

// Backwards compatibility with Tabler naming
export const TablerCompatibility: Story = {
  args: {
    name: "IconRocket",
    size: 24,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows backwards compatibility with Tabler icon naming (IconRocket -> Rocket)",
      },
    },
  },
};

export const CommonIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-6 p-4">
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Mail" size={24} />
        <span className="text-sm">Mail</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Folder" size={24} />
        <span className="text-sm">Folder</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Settings" size={24} />
        <span className="text-sm">Settings</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Rocket" size={24} />
        <span className="text-sm">Rocket</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Heart" size={24} />
        <span className="text-sm">Heart</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Star" size={24} />
        <span className="text-sm">Star</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Search" size={24} />
        <span className="text-sm">Search</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="User" size={24} />
        <span className="text-sm">User</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Common Lucide icons used throughout the application",
      },
    },
  },
};

export const TablerToLucideMigration: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tabler vs Lucide Naming</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium mb-3 text-muted-foreground">
              Tabler Names (Legacy)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <DynamicIcon name="IconMail" size={20} />
                <span className="text-sm">IconMail</span>
              </div>
              <div className="flex items-center gap-2">
                <DynamicIcon name="IconFolder" size={20} />
                <span className="text-sm">IconFolder</span>
              </div>
              <div className="flex items-center gap-2">
                <DynamicIcon name="IconSettings" size={20} />
                <span className="text-sm">IconSettings</span>
              </div>
              <div className="flex items-center gap-2">
                <DynamicIcon name="IconUser" size={20} />
                <span className="text-sm">IconUser</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium mb-3 text-primary">
              Lucide Names (Current)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <DynamicIcon name="Mail" size={20} />
                <span className="text-sm">Mail</span>
              </div>
              <div className="flex items-center gap-2">
                <DynamicIcon name="Folder" size={20} />
                <span className="text-sm">Folder</span>
              </div>
              <div className="flex items-center gap-2">
                <DynamicIcon name="Settings" size={20} />
                <span className="text-sm">Settings</span>
              </div>
              <div className="flex items-center gap-2">
                <DynamicIcon name="User" size={20} />
                <span className="text-sm">User</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Comparison between Tabler and Lucide naming conventions. Both work due to backwards compatibility mapping.",
      },
    },
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center flex-wrap">
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Rocket" size={12} />
        <span className="text-xs">12px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Rocket" size={16} />
        <span className="text-xs">16px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Rocket" size={20} />
        <span className="text-xs">20px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Rocket" size={24} />
        <span className="text-xs">24px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Rocket" size={32} />
        <span className="text-xs">32px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Rocket" size={48} />
        <span className="text-xs">48px</span>
      </div>
    </div>
  ),
};

export const InvalidIcon: Story = {
  args: {
    name: "NonExistentIcon",
    size: 24,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the fallback state when an icon doesn't exist",
      },
    },
  },
};

export const LoadingStates: Story = {
  render: () => (
    <div className="flex gap-6 items-center flex-wrap">
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="Download" size={24} />
        <span className="text-sm">Valid Icon</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="InvalidIconName" size={24} />
        <span className="text-sm">Invalid Icon</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="CheckCircle" size={24} className="text-green-600" />
        <span className="text-sm">With Color</span>
      </div>
    </div>
  ),
};

export const PopularLucideIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {[
        "Home",
        "User",
        "Settings",
        "Search",
        "Mail",
        "Bell",
        "Calendar",
        "Clock",
        "File",
        "Folder",
        "Image",
        "Video",
        "Download",
        "Upload",
        "Share",
        "Copy",
        "Edit",
        "Trash2",
        "Plus",
        "Minus",
        "X",
        "Check",
        "ChevronLeft",
        "ChevronRight",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Menu",
        "MoreHorizontal",
        "Eye",
        "EyeOff",
        "Lock",
        "Unlock",
        "Heart",
        "Star",
      ].map((iconName) => (
        <div key={iconName} className="flex flex-col items-center gap-2">
          <DynamicIcon name={iconName} size={20} />
          <span className="text-xs text-center">{iconName}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Popular Lucide icons that are commonly used in web applications",
      },
    },
  },
};

export const InteractiveIconTester: Story = {
  render: () => {
    const [iconName, setIconName] = useState("Rocket");
    const [iconSize, setIconSize] = useState(24);

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="iconName" className="text-sm font-medium">
            Icon Name:
          </label>
          <input
            id="iconName"
            type="text"
            value={iconName}
            onChange={(e) => setIconName(e.target.value)}
            className="border border-border rounded px-3 py-2 text-sm"
            placeholder="Try: Mail, Settings, IconUser, etc."
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="iconSize" className="text-sm font-medium">
            Size: {iconSize}px
          </label>
          <input
            id="iconSize"
            type="range"
            min="12"
            max="64"
            value={iconSize}
            onChange={(e) => setIconSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-center p-8 border border-border rounded-lg">
          <DynamicIcon name={iconName} size={iconSize} />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Try both Lucide names (e.g., "Mail") and Tabler names (e.g.,
          "IconMail")
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive tester to try different icon names and sizes",
      },
    },
  },
};

export const IconBrowser: Story = {
  render: () => {
    const [availableIcons, setAvailableIcons] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useState(() => {
      getAvailableIconNames().then((icons) => {
        setAvailableIcons(icons.slice(0, 50)); // Show first 50 icons
        setLoading(false);
      });
    });

    if (loading) {
      return <div className="p-4">Loading available icons...</div>;
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          First 50 available Lucide icons (out of {availableIcons.length}+
          total):
        </p>
        <div className="grid grid-cols-8 gap-3">
          {availableIcons.map((iconName) => (
            <div key={iconName} className="flex flex-col items-center gap-1">
              <DynamicIcon name={iconName} size={20} />
              <span
                className="text-xs text-center truncate w-full"
                title={iconName}
              >
                {iconName}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Browse available Lucide icons dynamically loaded from the library",
      },
    },
  },
};
