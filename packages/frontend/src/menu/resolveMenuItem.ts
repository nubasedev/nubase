import type { CommandRegistry } from "../commands/types";
import type { ResourceLink } from "../config/resource-link";
import type { IconComponent, MenuItem } from "./types";

/**
 * Resolved menu item with all display properties guaranteed.
 * This is what components receive after resolution.
 */
export interface ResolvedMenuItem {
  id: string;
  label: string;
  subtitle?: string;
  icon?: IconComponent;
  disabled?: boolean;
  variant?: "default" | "destructive";

  // Navigation/Action
  /** String path or ResourceLink for type-safe resource navigation */
  href?: string | ResourceLink;
  commandId?: string;
  commandArgs?: Record<string, unknown>;
  onExecute?: () => void | Promise<void>;
  onFocus?: () => void;

  // Hierarchy
  children?: ResolvedMenuItem[];
}

/**
 * Resolves a MenuItem by deriving missing label/icon from command definitions.
 *
 * Resolution priority:
 * 1. Explicit `label`/`icon` on the MenuItem (highest priority)
 * 2. `name`/`icon` from the referenced command definition
 * 3. `id` as fallback for label (lowest priority)
 *
 * @param item - The menu item to resolve
 * @param commandRegistry - Command registry to look up command definitions
 * @returns Resolved menu item with guaranteed label
 */
export function resolveMenuItem(
  item: MenuItem,
  commandRegistry?: CommandRegistry,
): ResolvedMenuItem {
  // Get command definition if command is provided
  const commandDef =
    typeof item.command === "string"
      ? commandRegistry?.getCommand(item.command)
      : item.command;

  const commandId =
    typeof item.command === "string" ? item.command : item.command?.id;

  // Resolve label: explicit > command.name > id
  const label = item.label ?? commandDef?.name ?? item.id;

  // Resolve icon: explicit > command.icon
  // Note: command.icon might be ReactNode (legacy) or ComponentType (new)
  // We only use it if it's a ComponentType
  const icon =
    item.icon ??
    (typeof commandDef?.icon === "function"
      ? (commandDef.icon as IconComponent)
      : undefined);

  // Resolve children recursively
  const children = item.children?.map((child) =>
    resolveMenuItem(child, commandRegistry),
  );

  return {
    id: item.id,
    label,
    subtitle: item.subtitle,
    icon,
    disabled: item.disabled,
    variant: item.variant,
    href: item.href,
    commandId,
    commandArgs: item.commandArgs,
    onExecute: item.onExecute,
    onFocus: item.onFocus,
    children,
  };
}

/**
 * Resolves an array of menu items.
 */
export function resolveMenuItems(
  items: MenuItem[],
  commandRegistry?: CommandRegistry,
): ResolvedMenuItem[] {
  return items.map((item) => resolveMenuItem(item, commandRegistry));
}
