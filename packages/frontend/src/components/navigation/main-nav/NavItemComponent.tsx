import { cva } from "class-variance-authority";
import type { FC } from "react";
import type { NavItem } from "../../../config/nav-item";
import { cn } from "../../../styling/cn";
import { SafeLink } from "./SafeLink";

const navItemVariants = cva(
  "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md group",
  {
    variants: {
      variant: {
        default: "text-muted-foreground hover:text-foreground hover:bg-muted",
        active: "text-foreground bg-muted border-l-2 border-l-primary",
        disabled: "text-muted-foreground cursor-not-allowed opacity-50",
      },
      level: {
        0: "ml-0",
        1: "ml-4",
        2: "ml-8",
        3: "ml-12",
      },
    },
    defaultVariants: {
      variant: "default",
      level: 0,
    },
  },
);

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
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="ml-auto px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full">
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
