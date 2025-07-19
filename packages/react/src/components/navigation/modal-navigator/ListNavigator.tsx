import type { ForwardedRef, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils";

export interface NavigatorItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onNavigate: () => void;
}

export interface ListNavigatorProps {
  items: NavigatorItem[];
  searchInputRef?: RefObject<HTMLInputElement> | ForwardedRef<HTMLInputElement>;
}

export const ListNavigator = ({
  items,
  searchInputRef,
}: ListNavigatorProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const itemsLength = items.length;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!itemsLength) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % itemsLength);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + itemsLength) % itemsLength);
      } else if (event.key === "Enter") {
        event.preventDefault();
        items[selectedIndex]?.onNavigate();
      }
    },
    [items, selectedIndex, itemsLength],
  );

  useEffect(() => {
    const searchInput =
      typeof searchInputRef === "object" &&
      searchInputRef &&
      "current" in searchInputRef
        ? searchInputRef.current
        : null;
    if (searchInput) {
      searchInput.addEventListener("keydown", handleKeyDown);
      return () => {
        searchInput.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleKeyDown, searchInputRef]);

  useEffect(() => {
    const currentItem = itemRefs.current[selectedIndex];
    if (currentItem) {
      currentItem.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (selectedIndex >= itemsLength) {
      setSelectedIndex(0);
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
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          type="button"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer w-full text-left transition-colors",
            index === selectedIndex
              ? "bg-primary text-primary-foreground"
              : "text-text hover:bg-surface-subtle",
          )}
          onClick={item.onNavigate}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="flex-shrink-0">{item.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{item.title}</div>
            {item.subtitle && (
              <div
                className={cn(
                  "text-xs truncate",
                  index === selectedIndex
                    ? "text-primary-foreground/80"
                    : "text-text-muted",
                )}
              >
                {item.subtitle}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
