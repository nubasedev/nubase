import { cva } from "class-variance-authority";
import { debounce } from "lodash-es";
import { Search, XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../styling/cn";

const searchFilterBarVariants = cva(["flex items-center gap-2", "flex-wrap"]);

const searchFilterBarInputVariants = cva([
  // Layout & Sizing
  "flex h-9 min-w-0",

  // Spacing & Borders (pl-10 for search icon)
  "pl-10 pr-3 py-1 rounded-md border border-input",

  // Background & Text
  "bg-transparent text-base",
  "dark:bg-input/30",

  // Visual Effects
  "shadow-xs outline-none",
  "transition-[color,box-shadow]",

  // Placeholder & Selection
  "placeholder:text-muted-foreground",
  "selection:bg-primary selection:text-primary-foreground",

  // Focus State
  "focus-visible:border-ring",
  "focus-visible:ring-ring/50 focus-visible:ring-[3px]",

  // Disabled State
  "disabled:pointer-events-none",
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
]);

const searchFilterBarClearButtonVariants = cva([
  "inline-flex items-center gap-1 h-9 px-3",
  "text-sm font-medium text-muted-foreground",
  "hover:text-foreground",
  "transition-colors",
  "cursor-pointer",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md",
  "disabled:pointer-events-none disabled:opacity-50",
]);

export type SearchFilterBarProps = {
  /** Current search query value */
  searchValue: string;

  /** Callback when search value changes (debounced if searchDebounceMs > 0) */
  onSearchChange: (value: string) => void;

  /** Placeholder for the search input */
  searchPlaceholder?: string;

  /** Width of the search input */
  searchWidth?: number | string;

  /** Debounce delay in ms for search input (default: 300, set to 0 to disable) */
  searchDebounceMs?: number;

  /** Filter components to render between search and clear button */
  children?: React.ReactNode;

  /** Callback when clear filters is clicked */
  onClearFilters?: () => void;

  /** Whether to show the clear filters button */
  showClearFilters?: boolean;

  /** Custom label for clear filters button */
  clearFiltersLabel?: string;

  /** Whether the search bar is disabled */
  disabled?: boolean;

  /** Additional className for the container */
  className?: string;
};

const SearchFilterBar = React.forwardRef<HTMLDivElement, SearchFilterBarProps>(
  (
    {
      searchValue,
      onSearchChange,
      searchPlaceholder = "Search...",
      searchWidth = 200,
      searchDebounceMs = 300,
      children,
      onClearFilters,
      showClearFilters = true,
      clearFiltersLabel = "Clear filters",
      disabled = false,
      className,
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = React.useState(searchValue);

    // Sync internal value when external value changes
    React.useEffect(() => {
      setInternalValue(searchValue);
    }, [searchValue]);

    // Create debounced callback
    const debouncedOnChange = React.useMemo(
      () =>
        searchDebounceMs > 0
          ? debounce((value: string) => onSearchChange(value), searchDebounceMs)
          : null,
      [onSearchChange, searchDebounceMs],
    );

    // Cleanup debounce on unmount
    React.useEffect(() => {
      return () => {
        debouncedOnChange?.cancel();
      };
    }, [debouncedOnChange]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      if (debouncedOnChange) {
        debouncedOnChange(newValue);
      } else {
        onSearchChange(newValue);
      }
    };

    const handleClearFilters = () => {
      // Cancel any pending debounced calls
      debouncedOnChange?.cancel();
      onClearFilters?.();
    };

    const searchWidthStyle =
      typeof searchWidth === "number" ? `${searchWidth}px` : searchWidth;

    return (
      <div
        ref={ref}
        className={cn(searchFilterBarVariants(), className)}
        data-slot="search-filter-bar"
      >
        {/* Search Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            value={internalValue}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className={cn(searchFilterBarInputVariants())}
            style={{ width: searchWidthStyle }}
            data-slot="search-filter-bar-input"
          />
          <div className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Search className="h-4 w-4" />
          </div>
        </div>

        {/* Filter Components */}
        {children}

        {/* Clear Filters Button */}
        {showClearFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={disabled}
            className={cn(searchFilterBarClearButtonVariants())}
            data-slot="search-filter-bar-clear"
          >
            <XIcon className="h-4 w-4" />
            {clearFiltersLabel}
          </button>
        )}
      </div>
    );
  },
);

SearchFilterBar.displayName = "SearchFilterBar";

export {
  SearchFilterBar,
  searchFilterBarVariants,
  searchFilterBarInputVariants,
  searchFilterBarClearButtonVariants,
};
