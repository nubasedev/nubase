import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type FlatItem,
  type TreeNavigatorItem,
  TreeNavigatorItemComponent,
} from "./TreeNavigatorItem";

export interface TreeNavigatorProps {
  items: TreeNavigatorItem[];
  searchInputRef?: RefObject<HTMLInputElement>;
  selectedItemId?: string;
  onSelectionChange?: (itemId: string) => void;
}

const TreeNavigatorComponent = ({
  items,
  searchInputRef,
}: TreeNavigatorProps) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Flatten tree structure for keyboard navigation
  const flattenItems = useCallback(
    (items: TreeNavigatorItem[], level = 0, parentId?: string): FlatItem[] => {
      const result: FlatItem[] = [];

      for (const item of items) {
        const hasChildren = Boolean(item.children?.length);
        const isExpanded = expandedItems.has(item.id);

        result.push({
          ...item,
          level,
          parentId,
          hasChildren,
          isExpanded,
        });

        if (hasChildren && isExpanded && item.children) {
          result.push(...flattenItems(item.children, level + 1, item.id));
        }
      }

      return result;
    },
    [expandedItems],
  );

  const flatItems = flattenItems(items);
  const itemsLength = flatItems.length;

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!itemsLength) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev === -1 ? 0 : (prev + 1) % itemsLength,
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev === -1
            ? itemsLength - 1
            : (prev - 1 + itemsLength) % itemsLength,
        );
      } else if (selectedIndex >= 0) {
        // Only handle other keys if an item is selected
        const currentItem = flatItems[selectedIndex];

        if (event.key === "ArrowRight") {
          event.preventDefault();
          if (currentItem?.hasChildren && !currentItem.isExpanded) {
            toggleExpanded(currentItem.id);
          }
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          if (currentItem?.hasChildren && currentItem.isExpanded) {
            toggleExpanded(currentItem.id);
          }
        } else if (event.key === "Enter") {
          event.preventDefault();
          if (currentItem?.hasChildren) {
            toggleExpanded(currentItem.id);
          } else {
            currentItem?.onNavigate?.();
          }
        }
      }
    },
    [flatItems, selectedIndex, itemsLength, toggleExpanded],
  );

  useEffect(() => {
    const searchInput = searchInputRef?.current;
    if (searchInput) {
      searchInput.addEventListener("keydown", handleKeyDown);
      return () => {
        searchInput.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleKeyDown, searchInputRef]);

  useEffect(() => {
    if (selectedIndex >= 0) {
      const currentItem = itemRefs.current[selectedIndex];
      if (currentItem) {
        currentItem.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
      // Call onFocus when item gets selected via keyboard
      flatItems[selectedIndex]?.onFocus?.();
    }
  }, [selectedIndex, flatItems]);

  useEffect(() => {
    if (selectedIndex >= itemsLength && itemsLength > 0) {
      setSelectedIndex(-1);
    }
  }, [selectedIndex, itemsLength]);

  if (!items.length) {
    return (
      <div className="py-8 text-center text-sm text-text-muted">
        No items found
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {flatItems.map((item, index) => (
        <TreeNavigatorItemComponent
          key={item.id}
          item={item}
          index={index}
          isSelected={selectedIndex >= 0 && index === selectedIndex}
          onToggleExpanded={toggleExpanded}
          itemRef={(el) => {
            itemRefs.current[index] = el;
          }}
        />
      ))}
    </div>
  );
};

// Export both names for backward compatibility and new functionality
export const TreeNavigator = TreeNavigatorComponent;
export const ListNavigator = TreeNavigatorComponent;
export type ListNavigatorItem = TreeNavigatorItem;
export type ListNavigatorProps = TreeNavigatorProps;

// Re-export types from TreeNavigatorItem
export type { FlatItem, TreeNavigatorItem } from "./TreeNavigatorItem";
