import type React from "react";
import type { TypedCommandDefinition } from "../commands/types";
import type { ResourceLink } from "../config/resource-link";

/**
 * Standard icon type used throughout Nubase.
 * Icons are passed as component types (not instantiated) for consistency and flexibility.
 */
export type IconComponent = React.ComponentType<{
  size?: number;
  className?: string;
}>;

/**
 * Unified menu item type that works for main navigation, command palettes,
 * global actions, and any other menu-like UI.
 *
 * This replaces the previous TreeNavigatorItem and Action types with a single,
 * consistent interface.
 *
 * @example
 * // Simple link navigation
 * { id: "home", label: "Home", icon: Home, href: "/" }
 *
 * @example
 * // Command-based action (derives label/icon from command)
 * { id: "theme", command: commands.workbenchSetTheme }
 *
 * @example
 * // Command with overridden label
 * { id: "create", label: "New Ticket", command: commands.workbenchOpenResourceOperation, commandArgs: { operation: "create" } }
 *
 * @example
 * // Hierarchical menu
 * {
 *   id: "settings",
 *   label: "Settings",
 *   icon: Settings,
 *   children: [
 *     { id: "theme", command: commands.workbenchSetTheme },
 *     { id: "profile", label: "Profile", href: "/settings/profile" },
 *   ]
 * }
 *
 * @example
 * // Direct handler (for simple cases)
 * { id: "logout", label: "Sign Out", icon: LogOut, onExecute: () => signOut() }
 */
export interface MenuItem {
  id: string;

  /**
   * Display label for the menu item.
   * Optional if `command` is provided - will be derived from command's `name`.
   * Required for `href` or `onExecute` items.
   */
  label?: string;

  /**
   * Optional subtitle/description shown below the label.
   */
  subtitle?: string;

  /**
   * Icon component (not instantiated).
   * Optional if `command` is provided - will be derived from command's `icon`.
   */
  icon?: IconComponent;

  /**
   * Whether the menu item is disabled.
   */
  disabled?: boolean;

  /**
   * Visual variant for the menu item.
   */
  variant?: "default" | "destructive";

  // --- Navigation/Action (pick one) ---

  /**
   * URL to navigate to. Uses client-side routing.
   * Can be a string path or a ResourceLink for type-safe resource navigation.
   * Mutually exclusive with `command` and `onExecute`.
   *
   * @example
   * // String path
   * { href: "/settings" }
   *
   * // Type-safe resource link
   * { href: resourceLink(ticketResource, "search") }
   */
  href?: string | ResourceLink;

  /**
   * Command to execute when the menu item is activated.
   * Can be a command definition object or a command ID string.
   * When provided, `label` and `icon` can be derived from the command.
   * Mutually exclusive with `href` and `onExecute`.
   */
  command?: TypedCommandDefinition<any> | string;

  /**
   * Arguments to pass to the command.
   * Only used when `command` is provided.
   */
  commandArgs?: Record<string, unknown>;

  /**
   * Direct handler function for simple actions.
   * Mutually exclusive with `href` and `command`.
   */
  onExecute?: () => void | Promise<void>;

  /**
   * Callback when this item receives focus (via keyboard navigation).
   * Useful for preview effects (e.g., theme preview on hover/focus).
   */
  onFocus?: () => void;

  // --- Hierarchy ---

  /**
   * Child menu items for hierarchical menus.
   * When present, the item acts as a parent/folder.
   */
  children?: MenuItem[];
}

/**
 * Menu item or separator literal for creating grouped menus.
 */
export type MenuItemOrSeparator = MenuItem | "separator";
