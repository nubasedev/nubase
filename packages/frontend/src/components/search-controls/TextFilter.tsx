import { TypeIcon, XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../styling/cn";
import { TextInput } from "../form-controls/controls/TextInput/TextInput";
import { SearchFilterDropdown } from "./SearchFilterDropdown";

export type TextFilterProps = {
  /** Label for the filter button */
  label: string;

  /** Current filter value */
  value: string;

  /** Callback when value changes */
  onChange: (value: string) => void;

  /** Placeholder for the text input */
  placeholder?: string;

  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;

  /** Width of the dropdown */
  dropdownWidth?: number;

  /** Whether the filter is disabled */
  disabled?: boolean;

  /** Additional className for the trigger button */
  className?: string;
};

const TextFilter = React.forwardRef<HTMLButtonElement, TextFilterProps>(
  (
    {
      label,
      value,
      onChange,
      placeholder = "Filter...",
      debounceMs = 300,
      dropdownWidth = 280,
      disabled = false,
      className,
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(value);
    const [isOpen, setIsOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

    // Sync internal value when external value changes
    React.useEffect(() => {
      setInternalValue(value);
    }, [value]);

    // Auto-focus input when dropdown opens
    React.useEffect(() => {
      if (isOpen) {
        // Small delay to ensure the popover content is rendered
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    // Cleanup debounce timer on unmount
    React.useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounced callback
      debounceTimerRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        // Immediately apply the value on Enter and close dropdown
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        onChange(internalValue);
        setIsOpen(false);
      }
    };

    const handleClear = () => {
      setInternalValue("");
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onChange("");
      inputRef.current?.focus();
    };

    const isActive = value.trim().length > 0;

    return (
      <SearchFilterDropdown
        ref={ref}
        label={label}
        isActive={isActive}
        showDotIndicator
        dropdownWidth={dropdownWidth}
        open={isOpen}
        onOpenChange={setIsOpen}
        disabled={disabled}
        className={className}
      >
        <div className="p-2">
          <div className="relative">
            <TextInput
              ref={inputRef}
              value={internalValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn("w-full pl-9", internalValue && "pr-9")}
            />
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <TypeIcon className="h-4 w-4" />
            </div>
            {internalValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Clear filter"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </SearchFilterDropdown>
    );
  },
);

TextFilter.displayName = "TextFilter";

export { TextFilter };
