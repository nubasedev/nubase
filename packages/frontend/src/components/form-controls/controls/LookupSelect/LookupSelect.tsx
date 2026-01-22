import type { Lookup } from "@nubase/core";
import { cva, type VariantProps } from "class-variance-authority";
import { useCombobox } from "downshift";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../../styling/cn";
import { ActivityIndicator } from "../../../activity-indicator/ActivityIndicator";

const lookupSelectVariants = cva([
  // Layout & Sizing
  "flex h-9 w-full min-w-0",

  // Spacing & Borders
  "px-3 py-1 rounded-md border border-input",

  // Background & Text
  "bg-transparent text-base",
  "dark:bg-input/30",

  // Visual Effects
  "shadow-xs outline-none",
  "transition-[color,box-shadow]",

  // Placeholder & Selection
  "placeholder:text-muted-foreground",
  "selection:bg-primary selection:text-primary-foreground",

  // File Input Styling
  "file:text-foreground file:inline-flex file:h-7",
  "file:border-0 file:bg-transparent file:text-sm file:font-medium",

  // Focus State
  "focus-visible:border-ring",
  "focus-visible:ring-ring/50 focus-visible:ring-[3px]",

  // Invalid State
  "aria-invalid:border-destructive",
  "aria-invalid:ring-destructive/20",
  "dark:aria-invalid:ring-destructive/40",

  // Disabled State
  "disabled:pointer-events-none",
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
]);

const menuVariants = cva([
  // Positioning
  "absolute z-50 w-full mt-1",

  // Background & Border
  "bg-background border border-border rounded-md",

  // Visual Effects
  "shadow-lg",

  // Sizing & Overflow
  "max-h-60 overflow-auto",

  // Text
  "text-sm",
]);

const optionVariants = cva(
  [
    // Layout
    "relative",

    // Spacing
    "px-3 py-2",

    // Interaction
    "cursor-pointer select-none",

    // Visual Effects
    "transition-colors",
  ],
  {
    variants: {
      isHighlighted: {
        true: "bg-secondary text-secondary-foreground",
        false: "text-foreground hover:bg-muted",
      },
      isSelected: {
        true: "bg-primary text-primary-foreground",
        false: "",
      },
    },
    defaultVariants: {
      isHighlighted: false,
      isSelected: false,
    },
  },
);

export type LookupSelectProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "onSelect"
> &
  VariantProps<typeof lookupSelectVariants> & {
    /**
     * Callback to search for items. Called when user types in the input.
     * Returns an array of Lookup items.
     */
    onSearch: (query: string) => Promise<Lookup[]>;

    /**
     * The currently selected value (ID of the selected item).
     */
    value?: string | number | null;

    /**
     * Callback when the selection changes.
     */
    onChange?: (value: string | number | null) => void;

    /**
     * Callback when a full item is selected.
     */
    onItemSelect?: (item: Lookup | null) => void;

    /**
     * Placeholder text shown when no value is selected.
     */
    placeholder?: string;

    /**
     * Whether the input is disabled.
     */
    disabled?: boolean;

    /**
     * Whether to show error styling.
     */
    hasError?: boolean;

    /**
     * Minimum number of characters before triggering search.
     * @default 1
     */
    minQueryLength?: number;

    /**
     * Debounce delay in milliseconds.
     * @default 300
     */
    debounceMs?: number;

    /**
     * Message shown when no results are found.
     */
    emptyMessage?: string;

    /**
     * Whether to allow clearing the selection.
     */
    clearable?: boolean;

    /**
     * Initial item to display (used when value is set but we need display text).
     */
    initialItem?: Lookup;
  };

/**
 * Avatar component for displaying user images in lookup items.
 */
const LookupAvatar = ({ src, title }: { src?: string; title: string }) => {
  const [hasError, setHasError] = useState(false);

  // Get initials from title (first two letters of first word, or first letters of first two words)
  const getInitials = (name: string): string => {
    const words = name
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const first = words[0];
    const second = words[1];
    if (first && second && first.length > 0 && second.length > 0) {
      return (first.charAt(0) + second.charAt(0)).toUpperCase();
    }
    if (first && first.length > 0) {
      return first.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  if (!src || hasError) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
        {getInitials(title)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      onError={() => setHasError(true)}
    />
  );
};

const LookupSelectInner = (
  {
    className,
    hasError,
    onSearch,
    value,
    onChange,
    onItemSelect,
    placeholder = "Search...",
    disabled = false,
    minQueryLength = 1,
    debounceMs = 300,
    emptyMessage = "No results found",
    clearable = true,
    initialItem,
    ...props
  }: LookupSelectProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState<Lookup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Lookup | null>(
    initialItem || null,
  );
  // Track the last value we initialized inputValue for, to avoid re-setting
  // inputValue when items change (which would override user typing)
  const lastInitializedValueRef = useRef<string | number | null | undefined>(
    undefined,
  );

  // Find selected item when value changes
  useEffect(() => {
    if (value === null || value === undefined) {
      setSelectedItem(null);
      lastInitializedValueRef.current = value;
      return;
    }

    // Only initialize inputValue if value has changed since last initialization
    const shouldInitialize = lastInitializedValueRef.current !== value;

    // If we have an initial item that matches, use it
    if (initialItem && initialItem.id === value) {
      setSelectedItem(initialItem);
      if (shouldInitialize) {
        setInputValue(initialItem.title);
        lastInitializedValueRef.current = value;
      }
      return;
    }

    // Check if the value matches an item in our current list
    const foundItem = items.find((item) => item.id === value);
    if (foundItem) {
      setSelectedItem(foundItem);
      if (shouldInitialize) {
        setInputValue(foundItem.title);
        lastInitializedValueRef.current = value;
      }
    }
  }, [value, initialItem, items]);

  // Debounced search
  useEffect(() => {
    if (inputValue.length < minQueryLength) {
      setItems([]);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await onSearch(inputValue);
        setItems(results);
        setHasSearched(true);
      } catch (error) {
        console.error("Lookup search failed:", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [inputValue, minQueryLength, debounceMs, onSearch]);

  const {
    isOpen,
    getInputProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    openMenu,
  } = useCombobox({
    items,
    selectedItem,
    inputValue,
    stateReducer: (state, actionAndChanges) => {
      const { type, changes } = actionAndChanges;
      // Prevent menu from closing on input click - we handle opening via onFocus
      if (type === useCombobox.stateChangeTypes.InputClick) {
        return { ...changes, isOpen: state.isOpen };
      }
      return changes;
    },
    onIsOpenChange: ({ isOpen: newIsOpen, type }) => {
      console.info("onIsOpenChange", { isOpen: newIsOpen, type });
    },
    onInputValueChange: ({ inputValue: newInputValue }) => {
      setInputValue(newInputValue || "");
    },
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
      console.info("onSelectedItemChange", { newSelectedItem });
      if (newSelectedItem) {
        onChange?.(newSelectedItem.id);
        onItemSelect?.(newSelectedItem);
        setInputValue(newSelectedItem.title);
      } else if (clearable) {
        onChange?.(null);
        onItemSelect?.(null);
        setInputValue("");
      }
    },
    itemToString: (item) => item?.title || "",
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    onItemSelect?.(null);
    setSelectedItem(null);
    setInputValue("");
    setItems([]);
    setHasSearched(false);
  };

  const showMenu = isOpen && (items.length > 0 || (hasSearched && !isLoading));

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      <div className="relative">
        <input
          {...getInputProps({
            className: cn(lookupSelectVariants(), "pr-16"),
            disabled,
            placeholder: selectedItem ? selectedItem.title : placeholder,
            "aria-invalid": hasError,
            "data-slot": "input",
            onFocus: () => {
              console.info("onFocus called", {
                selectedItem: selectedItem?.title,
                inputValue,
                isOpen,
              });
              // Reset input to show selected item's title when entering edit mode
              // This ensures a clean state when re-entering the field
              const resetValue = selectedItem?.title || "";
              if (inputValue !== resetValue) {
                console.info("Resetting inputValue", {
                  from: inputValue,
                  to: resetValue,
                });
                setInputValue(resetValue);
                setItems([]);
                setHasSearched(false);
              }
              if (inputValue.length >= minQueryLength) {
                console.info("Opening menu");
                openMenu();
              }
            },
          })}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
          {isLoading && <ActivityIndicator size="xs" color="primary" />}

          {clearable && selectedItem && !disabled && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
              aria-label="Clear selection"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Clear</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <svg
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              isOpen ? "rotate-180" : "rotate-0",
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Toggle dropdown</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <ul
        {...getMenuProps({
          className: cn(menuVariants(), !showMenu && "hidden"),
        })}
      >
        {showMenu &&
          (items.length === 0 ? (
            <li className="px-4 py-2 text-muted-foreground text-center">
              {emptyMessage}
            </li>
          ) : (
            items.map((item, index) => {
              const isSelected = selectedItem?.id === item.id;

              return (
                <li
                  key={`${item.id}-${index}`}
                  {...getItemProps({
                    item,
                    index,
                    className: cn(
                      optionVariants({
                        isHighlighted: highlightedIndex === index,
                        isSelected,
                      }),
                    ),
                  })}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <LookupAvatar src={item.image} title={item.title} />

                    {/* Text content */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-xs text-muted-foreground truncate">
                          {item.subtitle}
                        </span>
                      )}
                    </div>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <title>Selected</title>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </li>
              );
            })
          ))}
      </ul>
    </div>
  );
};

// Use forwardRef with a type assertion to preserve generics
export const LookupSelect = forwardRef(LookupSelectInner);

export { lookupSelectVariants };
