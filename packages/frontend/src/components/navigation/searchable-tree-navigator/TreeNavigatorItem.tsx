import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useTenantOptional } from "../../../context/TenantContext";
import type { MenuItem } from "../../../menu/types";
import { cn } from "../../../styling/cn";

/**
 * Internal flattened representation of a MenuItem for rendering.
 * Adds hierarchy metadata needed for tree display.
 */
export interface FlatMenuItem extends MenuItem {
  level: number;
  parentId?: string;
  isExpanded?: boolean;
  hasChildren: boolean;
}

interface MenuItemComponentProps {
  item: FlatMenuItem;
  index: number;
  isSelected: boolean;
  onToggleExpanded: (itemId: string) => void;
  itemRef: (el: HTMLButtonElement | null) => void;
  "data-testid"?: string;
}

export const MenuItemComponent = ({
  item,
  isSelected,
  onToggleExpanded,
  itemRef,
  "data-testid": testId,
}: MenuItemComponentProps) => {
  const tenant = useTenantOptional();

  const handleClick = () => {
    if (item.hasChildren) {
      onToggleExpanded(item.id);
    } else if (item.onExecute) {
      item.onExecute();
    }
  };

  // Build tenant-aware href if tenant is available and href doesn't already include it
  const resolvedHref = (() => {
    if (!item.href) return undefined;
    if (!tenant?.slug) return item.href;
    // If href already starts with /$tenant pattern, use as-is
    if (item.href.startsWith(`/${tenant.slug}`)) return item.href;
    // Prepend tenant to relative paths
    if (item.href.startsWith("/")) {
      return `/${tenant.slug}${item.href}`;
    }
    return item.href;
  })();

  const commonClassName = cn(
    "flex items-center gap-3 rounded-md py-2 pr-3 text-sm cursor-pointer w-full text-left transition-colors",
    isSelected
      ? "bg-primary text-primary-foreground"
      : "hover:bg-muted hover:text-muted-foreground",
  );

  const commonStyle = { paddingLeft: `${12 + item.level * 16}px` };

  // Instantiate icon if it's a component type
  const IconComponent = item.icon;
  const iconElement = IconComponent ? (
    <IconComponent size={16} className="flex-shrink-0" />
  ) : null;

  const content = (
    <>
      {iconElement && <div className="flex-shrink-0">{iconElement}</div>}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{item.label}</div>
        {item.subtitle && (
          <div
            className={cn(
              "text-xs truncate",
              isSelected ? "text-primary-foreground/80" : "text-text-muted",
            )}
          >
            {item.subtitle}
          </div>
        )}
      </div>
      {item.hasChildren && (
        <div className="flex-shrink-0">
          <div className="w-4 h-4 flex items-center justify-center">
            <ChevronRight
              size={12}
              className={cn(
                "transition-transform",
                item.isExpanded ? "rotate-90" : "rotate-0",
              )}
            />
          </div>
        </div>
      )}
    </>
  );

  // Use Link for href navigation, button for everything else
  if (resolvedHref && !item.hasChildren) {
    return (
      <Link
        key={item.id}
        ref={itemRef as any}
        to={resolvedHref}
        className={commonClassName}
        style={commonStyle}
        data-testid={testId}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      key={item.id}
      ref={itemRef}
      type="button"
      className={commonClassName}
      style={commonStyle}
      onClick={handleClick}
      data-testid={testId}
    >
      {content}
    </button>
  );
};

// Legacy exports for backward compatibility during migration
// TODO: Remove these after full migration
/** @deprecated Use MenuItem from '../../menu/types' instead */
export type TreeNavigatorItem = MenuItem;
/** @deprecated Use FlatMenuItem instead */
export type FlatItem = FlatMenuItem;
/** @deprecated Use MenuItemComponent instead */
export const TreeNavigatorItemComponent = MenuItemComponent;
