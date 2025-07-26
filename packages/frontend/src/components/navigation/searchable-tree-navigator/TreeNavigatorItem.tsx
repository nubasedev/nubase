import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "../../../styling/cn";

export interface TreeNavigatorItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onNavigate?: () => void;
  href?: string;
  onFocus?: () => void;
  children?: TreeNavigatorItem[];
}

export interface FlatItem extends TreeNavigatorItem {
  level: number;
  parentId?: string;
  isExpanded?: boolean;
  hasChildren: boolean;
}

interface TreeNavigatorItemComponentProps {
  item: FlatItem;
  index: number;
  isSelected: boolean;
  onToggleExpanded: (itemId: string) => void;
  itemRef: (el: HTMLButtonElement | null) => void;
}

export const TreeNavigatorItemComponent = ({
  item,
  isSelected,
  onToggleExpanded,
  itemRef,
}: TreeNavigatorItemComponentProps) => {
  const handleClick = () => {
    if (item.hasChildren) {
      onToggleExpanded(item.id);
    } else if (item.onNavigate) {
      item.onNavigate();
    }
  };

  const commonClassName = cn(
    "flex items-center gap-3 rounded-md py-2 pr-3 text-sm cursor-pointer w-full text-left transition-colors",
    isSelected
      ? "bg-primary text-primary-foreground"
      : "hover:bg-muted hover:text-muted-foreground",
  );

  const commonStyle = { paddingLeft: `${12 + item.level * 16}px` };

  const content = (
    <>
      <div className="flex-shrink-0">{item.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{item.title}</div>
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
  if (item.href && !item.hasChildren) {
    return (
      <Link
        key={item.id}
        ref={itemRef as any}
        to={item.href}
        className={commonClassName}
        style={commonStyle}
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
    >
      {content}
    </button>
  );
};
