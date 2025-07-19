import {
  IconBook,
  IconDashboard,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";
import { forwardRef } from "react";
import { SearchTextInput } from "../../form-controls/SearchTextInput/SearchTextInput";
import { ListNavigator, type NavigatorItem } from "./ListNavigator";

export type ModalNavigatorContentProps = {
  onClose?: () => void;
};

export const ModalNavigatorContent = forwardRef<
  HTMLInputElement,
  ModalNavigatorContentProps
>(({ onClose }, ref) => {
  const navigatorItems: NavigatorItem[] = [
    {
      id: "dashboard",
      icon: <IconDashboard className="h-4 w-4" />,
      title: "Go to Dashboard",
      subtitle: "View your main dashboard",
      onNavigate: () => {
        console.log("Navigate to Dashboard");
        onClose?.();
      },
    },
    {
      id: "create",
      icon: <IconPlus className="h-4 w-4" />,
      title: "Create New Item",
      subtitle: "Add a new item to your collection",
      onNavigate: () => {
        console.log("Create New Item");
        onClose?.();
      },
    },
    {
      id: "settings",
      icon: <IconSettings className="h-4 w-4" />,
      title: "View Settings",
      subtitle: "Configure your preferences",
      onNavigate: () => {
        console.log("View Settings");
        onClose?.();
      },
    },
    {
      id: "docs",
      icon: <IconBook className="h-4 w-4" />,
      title: "Open Documentation",
      subtitle: "Read the documentation",
      onNavigate: () => {
        console.log("Open Documentation");
        onClose?.();
      },
    },
  ];

  return (
    <div className="space-y-2">
      {/* Search Input */}
      <SearchTextInput
        ref={ref}
        placeholder="Search for commands, pages, or content..."
      />

      {/* Navigator List */}
      <ListNavigator items={navigatorItems} searchInputRef={ref} />

      {/* Footer with keyboard hint */}
      <div className="pt-3">
        <div className="text-xs text-text-muted">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-surface rounded text-xs">↑↓</kbd> to
          navigate,{" "}
          <kbd className="px-1.5 py-0.5 bg-surface rounded text-xs">Enter</kbd>{" "}
          to select,{" "}
          <kbd className="px-1.5 py-0.5 bg-surface rounded text-xs">Esc</kbd> to
          close
        </div>
      </div>
    </div>
  );
});

ModalNavigatorContent.displayName = "Navigator";
