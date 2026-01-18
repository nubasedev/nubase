import type { Lookup } from "@nubase/core";
import { cva } from "class-variance-authority";
import { debounce } from "lodash-es";
import * as React from "react";
import type { ResourceLookupConfig } from "../../config/resource";
import { cn } from "../../styling/cn";
import { ActivityIndicator } from "../activity-indicator";
import { Checkbox } from "../form-controls/controls/Checkbox/Checkbox";
import { SearchTextInput } from "../form-controls/controls/SearchTextInput/SearchTextInput";
import { useNubaseContext } from "../nubase-app/NubaseContextProvider";
import { SearchFilterDropdown } from "./SearchFilterDropdown";

const optionVariants = cva(
  [
    "flex items-center gap-2 px-3 py-2",
    "cursor-pointer select-none",
    "transition-colors",
  ],
  {
    variants: {
      isHighlighted: {
        true: "bg-muted",
        false: "hover:bg-muted/50",
      },
    },
    defaultVariants: {
      isHighlighted: false,
    },
  },
);

export type LookupSelectFilterProps = {
  /** Label for the filter button */
  label: string;

  /** Resource ID for lookup (e.g., "user") */
  lookupResource: string;

  /** Currently selected IDs */
  value: (string | number)[];

  /** Callback when selection changes */
  onChange: (value: (string | number)[]) => void;

  /** Minimum characters before search (default: 0 for loading all on open) */
  minQueryLength?: number;

  /** Debounce delay for search (default: 300) */
  debounceMs?: number;

  /** Width of the dropdown */
  dropdownWidth?: number;

  /** Maximum height of options list */
  maxHeight?: number;

  /** Whether the filter is disabled */
  disabled?: boolean;

  /** Additional className for the trigger button */
  className?: string;
};

export const LookupSelectFilter = React.forwardRef<
  HTMLButtonElement,
  LookupSelectFilterProps
>(
  (
    {
      label,
      lookupResource,
      value,
      onChange,
      minQueryLength = 0,
      debounceMs = 300,
      dropdownWidth = 320,
      maxHeight = 300,
      disabled = false,
      className,
    },
    ref,
  ) => {
    const context = useNubaseContext();
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [options, setOptions] = React.useState<Lookup[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const [selectedItems, setSelectedItems] = React.useState<
      Map<string | number, Lookup>
    >(new Map());

    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const optionsContainerRef = React.useRef<HTMLDivElement>(null);

    // Get the resource lookup configuration
    const resource = context.config.resources?.[lookupResource] as
      | { lookup?: ResourceLookupConfig }
      | undefined;
    const lookupConfig = resource?.lookup;

    // Create debounced search function
    const debouncedSearch = React.useMemo(() => {
      return debounce(async (query: string) => {
        if (!lookupConfig?.onSearch) {
          setOptions([]);
          setIsLoading(false);
          return;
        }

        try {
          const response = await lookupConfig.onSearch({
            query,
            context,
          });
          setOptions(response.data);
        } catch (error) {
          console.error("Lookup search failed:", error);
          setOptions([]);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);
    }, [lookupConfig, context, debounceMs]);

    // Cleanup debounce on unmount
    React.useEffect(() => {
      return () => {
        debouncedSearch.cancel();
      };
    }, [debouncedSearch]);

    // Fetch options when dropdown opens or search changes
    React.useEffect(() => {
      if (!isOpen || !lookupConfig?.onSearch) return;

      if (searchQuery.length < minQueryLength) {
        // If minQueryLength is 0, still search with empty string
        if (minQueryLength === 0) {
          setIsLoading(true);
          debouncedSearch("");
        } else {
          setOptions([]);
        }
        return;
      }

      setIsLoading(true);
      debouncedSearch(searchQuery);
    }, [isOpen, searchQuery, minQueryLength, lookupConfig, debouncedSearch]);

    // Load initial options when dropdown opens (if minQueryLength is 0)
    React.useEffect(() => {
      if (isOpen && minQueryLength === 0 && searchQuery === "") {
        setIsLoading(true);
        debouncedSearch("");
      }
    }, [isOpen, minQueryLength, searchQuery, debouncedSearch]);

    // Auto-focus search input when dropdown opens
    React.useEffect(() => {
      if (isOpen) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    // Reset search and highlight when closing
    React.useEffect(() => {
      if (!isOpen) {
        setSearchQuery("");
        setHighlightedIndex(-1);
      }
    }, [isOpen]);

    // Fetch display info for selected items that aren't in current options
    React.useEffect(() => {
      if (!lookupConfig?.onSearch || value.length === 0) return;

      // Find values that need display info
      const missingIds = value.filter((v) => !selectedItems.has(v));
      if (missingIds.length === 0) return;

      // Fetch with empty query to get items by ID
      lookupConfig.onSearch({ query: "", context }).then((response) => {
        const newItems = new Map(selectedItems);
        for (const item of response.data) {
          if (value.includes(item.id)) {
            newItems.set(item.id, item);
          }
        }
        setSelectedItems(newItems);
      });
    }, [value, lookupConfig, context, selectedItems]);

    const isValueSelected = (id: string | number): boolean => {
      return value.includes(id);
    };

    const toggleOption = (item: Lookup) => {
      if (isValueSelected(item.id)) {
        onChange(value.filter((v) => v !== item.id));
        // Keep the item in selectedItems for display purposes
      } else {
        onChange([...value, item.id]);
        // Store the item for display
        setSelectedItems((prev) => new Map(prev).set(item.id, item));
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : options.length - 1,
          );
          break;
        case "Enter":
        case " ": {
          const highlightedOption = options[highlightedIndex];
          if (highlightedIndex >= 0 && highlightedOption) {
            e.preventDefault();
            toggleOption(highlightedOption);
          }
          break;
        }
        case "Escape":
          setIsOpen(false);
          break;
      }
    };

    // Scroll highlighted option into view
    React.useEffect(() => {
      if (highlightedIndex >= 0 && optionsContainerRef.current) {
        const container = optionsContainerRef.current;
        const highlightedElement = container.children[
          highlightedIndex
        ] as HTMLElement;
        if (highlightedElement) {
          highlightedElement.scrollIntoView({ block: "nearest" });
        }
      }
    }, [highlightedIndex]);

    const isActive = value.length > 0;
    const activeCount = value.length;

    // Error handling
    if (!resource) {
      return (
        <SearchFilterDropdown
          ref={ref}
          label={label}
          isActive={false}
          dropdownWidth={dropdownWidth}
          disabled
          className={className}
        >
          <div className="p-3 text-sm text-destructive">
            Resource "{lookupResource}" not found
          </div>
        </SearchFilterDropdown>
      );
    }

    if (!lookupConfig) {
      return (
        <SearchFilterDropdown
          ref={ref}
          label={label}
          isActive={false}
          dropdownWidth={dropdownWidth}
          disabled
          className={className}
        >
          <div className="p-3 text-sm text-destructive">
            Resource "{lookupResource}" has no lookup configured
          </div>
        </SearchFilterDropdown>
      );
    }

    return (
      <SearchFilterDropdown
        ref={ref}
        label={label}
        isActive={isActive}
        activeCount={activeCount}
        dropdownWidth={dropdownWidth}
        open={isOpen}
        onOpenChange={setIsOpen}
        disabled={disabled}
        className={className}
      >
        <div
          role="listbox"
          aria-multiselectable="true"
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <SearchTextInput
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(-1);
              }}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full"
            />
          </div>

          {/* Options List */}
          <div
            ref={optionsContainerRef}
            className="overflow-y-auto"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <ActivityIndicator size="sm" />
              </div>
            ) : options.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                {searchQuery.length > 0
                  ? "No results found"
                  : minQueryLength > 0
                    ? `Type at least ${minQueryLength} characters to search`
                    : "No options available"}
              </div>
            ) : (
              options.map((item, index) => {
                const isSelected = isValueSelected(item.id);
                const isHighlighted = highlightedIndex === index;

                return (
                  <div
                    key={String(item.id)}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    className={cn(optionVariants({ isHighlighted }))}
                    onClick={() => toggleOption(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleOption(item);
                      }
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOption(item)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {/* Avatar */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                    )}
                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </SearchFilterDropdown>
    );
  },
);

LookupSelectFilter.displayName = "LookupSelectFilter";
