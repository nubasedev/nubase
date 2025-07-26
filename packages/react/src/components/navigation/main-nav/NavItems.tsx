import type { FC } from "react";
import type { NavItem } from "../../../config/nav-item";
import { NavItemComponent } from "./NavItemComponent";

// Main NavItems component
interface NavItemsProps {
  items: NavItem[];
  level?: number;
  expandedItems: string[];
  activeItemId?: string;
  onToggle: (id: string) => void;
  onItemClick?: (item: NavItem) => void;
}

export const NavItems: FC<NavItemsProps> = ({
  items,
  level = 0,
  expandedItems,
  activeItemId,
  onToggle,
  onItemClick,
}) => {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const isExpanded = expandedItems.includes(item.id);
        const isActive = activeItemId === item.id;

        return (
          <div key={item.id}>
            <NavItemComponent
              item={item}
              level={level}
              isExpanded={isExpanded}
              isActive={isActive}
              onToggle={onToggle}
              onItemClick={onItemClick}
            />
            {isExpanded && item.children && (
              <NavItems
                items={item.children}
                level={level + 1}
                expandedItems={expandedItems}
                activeItemId={activeItemId}
                onToggle={onToggle}
                onItemClick={onItemClick}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
