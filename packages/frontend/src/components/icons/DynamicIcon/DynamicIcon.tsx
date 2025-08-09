import { type ComponentType, useEffect, useState } from "react";

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

// Mapping from common Tabler icon names to Lucide icon names
const iconNameMapping: Record<string, string> = {
  IconFolder: "Folder",
  IconSettings: "Settings",
  IconRocket: "Rocket",
  IconHeart: "Heart",
  IconStarFilled: "Star",
  IconStar: "Star",
  IconDownload: "Download",
  IconSun: "Sun",
  IconMoon: "Moon",
  IconSearch: "Search",

  // Navigation
  IconChevronLeft: "ChevronLeft",
  IconChevronRight: "ChevronRight",
  IconChevronUp: "ChevronUp",
  IconChevronDown: "ChevronDown",
  IconArrowLeft: "ArrowLeft",
  IconArrowRight: "ArrowRight",
  IconArrowUp: "ArrowUp",
  IconArrowDown: "ArrowDown",

  // Actions
  IconPlus: "Plus",
  IconMinus: "Minus",
  IconX: "X",
  IconCheck: "Check",
  IconEdit: "Edit",
  IconTrash: "Trash2",
  IconCopy: "Copy",
  IconSave: "Save",
  IconUpload: "Upload",
  IconRefresh: "RefreshCw",

  // UI Elements
  IconMenu: "Menu",
  IconDotsVertical: "MoreVertical",
  IconDotsHorizontal: "MoreHorizontal",
  IconHome: "Home",
  IconUser: "User",
  IconUsers: "Users",
  IconEye: "Eye",
  IconEyeOff: "EyeOff",
  IconBell: "Bell",
  IconNotification: "Bell",

  // Files & Media
  IconFile: "File",
  IconFileText: "FileText",
  IconImage: "Image",
  IconVideo: "Video",
  IconMusic: "Music",
  IconMicrophone: "Mic",
  IconCamera: "Camera",

  // Communication
  IconMessage: "MessageSquare",
  IconMessageCircle: "MessageCircle",
  IconPhone: "Phone",
  // Basic icons

  IconMail: "Mail",
  IconShare: "Share",

  // System
  IconLock: "Lock",
  IconLockOpen: "LockOpen",
  IconShield: "Shield",
  IconKey: "Key",
  IconDatabase: "Database",
  IconServer: "Server",
  IconCloud: "Cloud",
  IconWifi: "Wifi",

  // Status
  IconAlertCircle: "AlertCircle",
  IconAlertTriangle: "AlertTriangle",
  IconInfoCircle: "Info",
  IconCheckCircle: "CheckCircle",
  IconXCircle: "XCircle",

  // Tools
  IconTool: "Wrench",
  IconHammer: "Hammer",
  IconBrush: "Paintbrush",
  IconPalette: "Palette",
  IconBulb: "Lightbulb",
  IconCalculator: "Calculator",

  // Time
  IconClock: "Clock",
  IconCalendar: "Calendar",
  IconCalendarEvent: "CalendarDays",

  // Commerce
  IconShoppingCart: "ShoppingCart",
  IconCreditCard: "CreditCard",
  IconCoin: "Coins",
  IconGift: "Gift",

  // Social
  IconThumbUp: "ThumbsUp",
  IconThumbDown: "ThumbsDown",
  IconBookmark: "Bookmark",
  IconFlag: "Flag",

  // Layout
  IconLayout: "Layout",
  IconGrid: "Grid3X3",
  IconList: "List",
  IconColumns: "Columns",

  // Development
  IconCode: "Code",
  IconTerminal: "Terminal",
  IconBrandGit: "GitBranch",
  IconGitBranch: "GitBranch",
  IconGitCommit: "GitCommit",
  IconBug: "Bug",

  // Common aliases and variations
  IconClose: "X",
  IconDelete: "Trash2",
  IconRemove: "X",
  IconAdd: "Plus",
  IconCreate: "Plus",
  IconNew: "Plus",
  IconCancel: "X",
  IconOk: "Check",
  IconAccept: "Check",
  IconReject: "X",
};

const getIcon = async (
  name: string,
): Promise<ComponentType<{ size?: number; className?: string }> | null> => {
  try {
    // First, try to map from Tabler naming to Lucide naming
    const lucideName = iconNameMapping[name] || name;

    const module = await import("lucide-react");
    const IconComponent = module[
      lucideName as keyof typeof module
    ] as ComponentType<{
      size?: number;
      className?: string;
    }>;

    return IconComponent || null;
  } catch {
    return null;
  }
};

/**
 * DynamicIcon component that loads Lucide icons dynamically based on the provided name.
 *
 * Supports both direct Lucide icon names (e.g., "Mail", "Settings") and Tabler icon names
 * (e.g., "IconMail", "IconSettings") for backwards compatibility during migration.
 */
export const DynamicIcon = ({
  name,
  size = 16,
  className,
}: DynamicIconProps) => {
  const [IconComponent, setIconComponent] = useState<ComponentType<{
    size?: number;
    className?: string;
  }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadIcon = async () => {
      setIsLoading(true);
      setError(false);

      try {
        const icon = await getIcon(name);
        if (mounted) {
          setIconComponent(() => icon);
          setError(!icon);
        }
      } catch {
        if (mounted) {
          setIconComponent(null);
          setError(true);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadIcon();

    return () => {
      mounted = false;
    };
  }, [name]);

  if (isLoading) {
    return (
      <div
        className={`inline-block animate-pulse bg-muted rounded ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (error || !IconComponent) {
    return (
      <div
        className={`inline-block bg-muted-foreground/20 rounded flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        title={`Icon not found: ${name}`}
      >
        <span className="text-xs text-muted-foreground">?</span>
      </div>
    );
  }

  return <IconComponent size={size} className={className} />;
};

// Helper function to get all available icon names (useful for development/debugging)
export const getAvailableIconNames = async (): Promise<string[]> => {
  try {
    const module = await import("lucide-react");
    return Object.keys(module).filter(
      (key) => typeof module[key as keyof typeof module] === "function",
    );
  } catch {
    return [];
  }
};

// Helper function to check if an icon exists
export const iconExists = async (name: string): Promise<boolean> => {
  try {
    const icon = await getIcon(name);
    return icon !== null;
  } catch {
    return false;
  }
};
