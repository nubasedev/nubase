import type { FC } from "react";
import { cn } from "src/utils";
import type { NavItem } from "@nubase/core";
import { SafeLink } from "./SafeLink";
import { navItemVariants } from "./variants";

// NavItem component
interface NavItemComponentProps {
  item: NavItem;
  level: number;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: (id: string) => void;
  onItemClick?: (item: NavItem) => void;
}

export const NavItemComponent: FC<NavItemComponentProps> = ({
  item,
  level,
  isExpanded,
  isActive,
  onToggle,
  onItemClick,
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isLeaf = !hasChildren;

  const handleClick = () => {
    if (hasChildren) {
      onToggle(item.id);
    } else if (item.onClick) {
      item.onClick();
      onItemClick?.(item);
    }
  };

  const content = (
    <>
      <div className="flex items-center gap-2 flex-1">
        {item.icon && (
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {item.icon}
          </span>
        )}
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="ml-auto px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
            {item.badge}
          </span>
        )}
      </div>
      {hasChildren && (
        <span
          className={cn(
            "flex-shrink-0 w-4 h-4 transition-transform duration-200",
            isExpanded ? "transform rotate-90" : "",
          )}
        >
          ▶
        </span>
      )}
    </>
  );

  const variant = item.disabled ? "disabled" : isActive ? "active" : "default";
  const className = navItemVariants({
    variant,
    level: Math.min(level, 3) as 0 | 1 | 2 | 3,
  });

  if (isLeaf && item.href && !item.disabled) {
    return (
      <SafeLink
        to={item.href}
        className={className}
        onClick={() => onItemClick?.(item)}
      >
        {content}
      </SafeLink>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={item.disabled}
    >
      {content}
    </button>
  );
};
