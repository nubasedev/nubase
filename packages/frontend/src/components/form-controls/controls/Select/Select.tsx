import { cva, type VariantProps } from "class-variance-authority";
import { useCombobox, useSelect } from "downshift";
import type React from "react";
import { forwardRef, useMemo, useState } from "react";
import { cn } from "../../../../styling/cn";

const selectVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
);

const menuVariants = cva(
  "absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto text-sm",
);

const optionVariants = cva(
  "px-4 py-2 cursor-pointer transition-colors select-none",
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

export interface SelectOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T = unknown>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onSelect">,
    VariantProps<typeof selectVariants> {
  options: SelectOption<T>[];
  value?: T;
  onChange?: (value: T | null) => void;
  onSelectionChange?: (selectedItem: SelectOption<T> | null) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  clearable?: boolean;
  searchable?: boolean;
  filterOptions?: (
    options: SelectOption<T>[],
    inputValue: string,
  ) => SelectOption<T>[];
}

const Select = forwardRef<HTMLDivElement, SelectProps<any>>(
  <T,>(
    {
      className,
      hasError,
      options = [],
      value,
      onChange,
      onSelectionChange,
      placeholder = "Select an option...",
      disabled = false,
      loading = false,
      loadingMessage = "Loading...",
      emptyMessage = "No options available",
      clearable = false,
      searchable = false,
      filterOptions,
      ...props
    }: SelectProps<T>,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    // Find selected item based on value
    const selectedItem = useMemo(() => {
      return options.find((option) => option.value === value) || null;
    }, [options, value]);

    // State for searchable input
    const [inputValue, setInputValue] = useState("");

    // Default filter function for searchable selects
    const defaultFilterOptions = (
      opts: SelectOption<T>[],
      inputValue: string,
    ) => {
      return opts.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()),
      );
    };

    const actualFilterOptions = filterOptions || defaultFilterOptions;

    // Filter options when searchable
    const filteredOptions = useMemo(() => {
      if (!searchable || !inputValue) return options;
      return actualFilterOptions(options, inputValue);
    }, [searchable, inputValue, options, actualFilterOptions]);

    const displayOptions = loading ? [] : filteredOptions;

    // Use different downshift hooks based on searchable mode
    const selectHook = useSelect({
      items: displayOptions,
      selectedItem,
      onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
        if (newSelectedItem) {
          onChange?.(newSelectedItem.value);
          onSelectionChange?.(newSelectedItem);
        } else if (clearable) {
          onChange?.(null);
          onSelectionChange?.(null);
        }
      },
      itemToString: (item) => item?.label || "",
    });

    const comboboxHook = useCombobox({
      items: displayOptions,
      selectedItem,
      inputValue,
      onInputValueChange: ({ inputValue }) => {
        setInputValue(inputValue || "");
      },
      onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
        if (newSelectedItem) {
          onChange?.(newSelectedItem.value);
          onSelectionChange?.(newSelectedItem);
          setInputValue(newSelectedItem.label);
        } else if (clearable) {
          onChange?.(null);
          onSelectionChange?.(null);
          setInputValue("");
        }
      },
      itemToString: (item) => item?.label || "",
    });

    // Use appropriate hook based on searchable mode
    const hook = searchable ? comboboxHook : selectHook;
    const {
      isOpen,
      getToggleButtonProps,
      getMenuProps,
      getItemProps,
      highlightedIndex,
    } = hook;

    // Get input props for searchable mode
    const getInputProps = searchable ? comboboxHook.getInputProps : undefined;

    const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
      <svg
        className={cn(
          "w-5 h-5 transition-transform duration-200",
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
    );

    const ClearIcon = () => (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <title>Clear selection</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
      onSelectionChange?.(null);
    };

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div className="relative">
          {searchable ? (
            <input
              {...(getInputProps?.({
                className: cn(selectVariants(), "pr-10"),
                disabled,
                placeholder: selectedItem?.label || placeholder,
                "aria-invalid": hasError,
                "data-slot": "input",
              }) || {})}
            />
          ) : (
            <button
              type="button"
              {...getToggleButtonProps({
                className: cn(
                  selectVariants(),
                  "items-center justify-between pr-10 cursor-pointer",
                  !selectedItem && "text-muted-foreground",
                ),
                disabled: disabled || loading,
                "aria-invalid": hasError,
                "data-slot": "input",
              })}
            >
              <span className="truncate">
                {loading ? loadingMessage : selectedItem?.label || placeholder}
              </span>
            </button>
          )}

          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            ) : (
              <ChevronIcon isOpen={isOpen} />
            )}
          </div>

          {clearable && selectedItem && !disabled && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-8 flex items-center pr-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear selection"
            >
              <ClearIcon />
            </button>
          )}
        </div>

        <ul
          {...getMenuProps({
            className: cn(menuVariants(), !isOpen && "hidden"),
          })}
        >
          {isOpen &&
            (displayOptions.length === 0 ? (
              <li className="px-4 py-2 text-muted-foreground text-center">
                {loading ? loadingMessage : emptyMessage}
              </li>
            ) : (
              displayOptions.map((option, index) => (
                <li
                  key={`${option.value}-${index}`}
                  {...getItemProps({
                    item: option,
                    index,
                    className: cn(
                      optionVariants({
                        isHighlighted: highlightedIndex === index,
                        isSelected: selectedItem?.value === option.value,
                      }),
                      option.disabled && "opacity-50 cursor-not-allowed",
                    ),
                    style: option.disabled
                      ? { pointerEvents: "none" }
                      : undefined,
                  })}
                >
                  <span className="block truncate">{option.label}</span>
                  {selectedItem?.value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="w-4 h-4"
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
                    </span>
                  )}
                </li>
              ))
            ))}
        </ul>
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select, selectVariants };
