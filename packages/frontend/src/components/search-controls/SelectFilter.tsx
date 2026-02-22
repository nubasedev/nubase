import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../styling/cn";
import { Checkbox } from "../form-controls/controls/Checkbox/Checkbox";
import { SearchTextInput } from "../form-controls/controls/SearchTextInput/SearchTextInput";
import { SearchFilterDropdown } from "./SearchFilterDropdown";

const optionVariants = cva(
  [
    // Layout
    "flex items-center gap-2 px-3 py-2",

    // Interaction
    "cursor-pointer select-none",

    // Visual Effects
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

export type SelectFilterOption<T = string> = {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type SelectFilterProps<T = string> = {
  /** Label for the filter button */
  label: string;

  /** Available options */
  options: SelectFilterOption<T>[];

  /** Currently selected values */
  value: T[];

  /** Callback when selection changes */
  onChange: (value: T[]) => void;

  /** Whether to show search input */
  searchable?: boolean;

  /** Placeholder for search input */
  searchPlaceholder?: string;

  /** Custom filter function */
  filterOptions?: (
    options: SelectFilterOption<T>[],
    query: string,
  ) => SelectFilterOption<T>[];

  /** Message when no options match search */
  emptyMessage?: string;

  /** Show "Select All" / "Clear All" buttons */
  showSelectAllClear?: boolean;

  /** Maximum height of options list */
  maxHeight?: number;

  /** Width of the dropdown */
  dropdownWidth?: number;

  /** Whether the filter is disabled */
  disabled?: boolean;

  /** Additional className for the trigger button */
  className?: string;

  /** Forwarded ref for the trigger button */
  ref?: React.Ref<HTMLButtonElement>;
};

function SelectFilter<T = string>({
  label,
  options,
  value,
  onChange,
  searchable = false,
  searchPlaceholder = "Search...",
  filterOptions,
  emptyMessage = "No options found",
  showSelectAllClear = false,
  maxHeight = 300,
  dropdownWidth = 280,
  disabled = false,
  className,
  ref,
}: SelectFilterProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const optionsContainerRef = React.useRef<HTMLDivElement>(null);

  // Default filter function
  const defaultFilterOptions = (
    opts: SelectFilterOption<T>[],
    query: string,
  ): SelectFilterOption<T>[] => {
    if (!query.trim()) return opts;
    const lowerQuery = query.toLowerCase();
    return opts.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lowerQuery) ||
        opt.description?.toLowerCase().includes(lowerQuery),
    );
  };

  const actualFilterOptions = filterOptions || defaultFilterOptions;
  const filteredOptions = actualFilterOptions(options, searchQuery);

  // Auto-focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchable) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchable]);

  // Reset search and highlight when closing
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const isValueSelected = (optionValue: T): boolean => {
    return value.some((v) => v === optionValue);
  };

  const toggleOption = (optionValue: T) => {
    if (isValueSelected(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const selectAll = () => {
    const allValues = filteredOptions
      .filter((opt) => !opt.disabled)
      .map((opt) => opt.value);
    // Merge with existing selections (in case some were filtered out)
    const newValue = [...new Set([...value, ...allValues])];
    onChange(newValue);
  };

  const clearAll = () => {
    // Only clear values that are in the current filtered options
    const filteredValues = new Set(filteredOptions.map((opt) => opt.value));
    const newValue = value.filter((v) => !filteredValues.has(v));
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const enabledOptions = filteredOptions.filter((opt) => !opt.disabled);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < enabledOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : enabledOptions.length - 1,
        );
        break;
      case "Enter":
      case " ": {
        const highlightedOption = enabledOptions[highlightedIndex];
        if (highlightedIndex >= 0 && highlightedOption) {
          e.preventDefault();
          toggleOption(highlightedOption.value);
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
      <div role="listbox" aria-multiselectable="true" onKeyDown={handleKeyDown}>
        {/* Search Input */}
        {searchable && (
          <div className="p-2 border-b border-border">
            <SearchTextInput
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(-1);
              }}
              placeholder={searchPlaceholder}
              className="w-full"
            />
          </div>
        )}

        {/* Select All / Clear All */}
        {showSelectAllClear && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-border text-sm">
            <button
              type="button"
              onClick={selectAll}
              className="text-primary hover:underline focus:outline-none"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-muted-foreground hover:text-foreground focus:outline-none"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Options List */}
        <div
          ref={optionsContainerRef}
          className="overflow-y-auto"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = isValueSelected(option.value);
              const isHighlighted = highlightedIndex === index;

              return (
                <div
                  key={String(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  tabIndex={0}
                  className={cn(
                    optionVariants({ isHighlighted }),
                    option.disabled && "opacity-50 cursor-not-allowed",
                  )}
                  onClick={() => {
                    if (!option.disabled) {
                      toggleOption(option.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      (e.key === "Enter" || e.key === " ") &&
                      !option.disabled
                    ) {
                      e.preventDefault();
                      toggleOption(option.value);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!option.disabled) {
                      setHighlightedIndex(index);
                    }
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={option.disabled}
                    onCheckedChange={() => {
                      if (!option.disabled) {
                        toggleOption(option.value);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {option.description}
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
}

export { SelectFilter, optionVariants };
