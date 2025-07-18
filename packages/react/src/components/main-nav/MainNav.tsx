import type { NavItem } from "@nubase/core";
import type { VariantProps } from "class-variance-authority";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { cn } from "../../utils";
import { NavItems } from "./NavItems";
import { filterNavItems, flattenNavItems } from "./types";
import { mainNavVariants, searchVariants } from "./variants";

export interface MainNavProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mainNavVariants> {
  items: NavItem[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  activeItemId?: string;
  expandedItems?: string[];
  onExpandedChange?: (expandedItems: string[]) => void;
}

export const MainNav = forwardRef<HTMLDivElement, MainNavProps>(
  (
    {
      className,
      width,
      items,
      searchPlaceholder = "Search navigation...",
      onSearch,
      activeItemId,
      expandedItems: controlledExpandedItems,
      onExpandedChange,
      ...props
    },
    ref,
  ) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [internalExpandedItems, setInternalExpandedItems] = useState<
      string[]
    >([]);
    const [searchFocused, setSearchFocused] = useState(false);

    // Use controlled or internal expanded state
    const expandedItems = controlledExpandedItems || internalExpandedItems;
    const setExpandedItems = onExpandedChange || setInternalExpandedItems;

    // Filter items based on search
    const filteredItems = useMemo(
      () => filterNavItems(items, searchQuery),
      [items, searchQuery],
    );

    // Auto-expand filtered items when searching (using useEffect to avoid infinite loops)
    useEffect(() => {
      if (searchQuery.trim()) {
        // When searching, expand all parent items that contain matches
        const flatItems = flattenNavItems(filteredItems);
        const itemsToExpand = flatItems
          .filter((item) => item.children && item.children.length > 0)
          .map((item) => item.id);

        if (itemsToExpand.length > 0) {
          const newExpanded = [
            ...new Set([...expandedItems, ...itemsToExpand]),
          ];
          // Only update if the expanded items actually changed
          if (
            newExpanded.length !== expandedItems.length ||
            !newExpanded.every((id) => expandedItems.includes(id))
          ) {
            setExpandedItems(newExpanded);
          }
        }
      }
    }, [filteredItems, searchQuery, expandedItems, setExpandedItems]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      onSearch?.(query);
    };

    const handleToggle = (id: string) => {
      const newExpanded = expandedItems.includes(id)
        ? expandedItems.filter((item) => item !== id)
        : [...expandedItems, id];
      setExpandedItems(newExpanded);
    };

    const handleItemClick = (item: NavItem) => {
      // Optional: You can add global item click handling here
      console.log("Navigation item clicked:", item);
    };

    return (
      <div
        ref={ref}
        className={cn(mainNavVariants({ width }), className)}
        {...props}
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                searchVariants({ focused: searchFocused }),
                "pl-10 outline-none",
              )}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-placeholder">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-label="Search"
              >
                <title>Search</title>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-2">
          <NavItems
            items={filteredItems}
            expandedItems={expandedItems}
            activeItemId={activeItemId}
            onToggle={handleToggle}
            onItemClick={handleItemClick}
          />
        </div>
      </div>
    );
  },
);

MainNav.displayName = "MainNav";
