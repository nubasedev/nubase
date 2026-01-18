import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon, TypeIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../styling/cn";

const searchFilterTriggerVariants = cva(
  [
    // Base - matching TextInput height/roundness
    "inline-flex items-center gap-1.5 h-9 px-3 rounded-md",
    "text-sm font-medium",
    "border transition-all",
    "cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      isActive: {
        true: "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15",
        false:
          "bg-transparent text-foreground border-input hover:bg-muted dark:bg-input/30",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
);

const searchFilterContentVariants = cva([
  // Background & Border
  "bg-popover text-popover-foreground",
  "border rounded-md shadow-md",

  // Positioning
  "z-50",

  // Animations
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  "data-[side=bottom]:slide-in-from-top-2",
  "data-[side=left]:slide-in-from-right-2",
  "data-[side=right]:slide-in-from-left-2",
  "data-[side=top]:slide-in-from-bottom-2",
]);

export type SearchFilterDropdownProps = {
  /** Label displayed on the button */
  label: string;

  /** Whether the filter has an active selection */
  isActive?: boolean;

  /** Count to display as badge when active (e.g., "Epic 1") */
  activeCount?: number;

  /** Show a dot indicator instead of count when active (for text filters) */
  showDotIndicator?: boolean;

  /** Content to render inside the dropdown */
  children: React.ReactNode;

  /** Width of the dropdown content (number in px, "trigger" to match trigger width, or "auto") */
  dropdownWidth?: number | "trigger" | "auto";

  /** Callback when dropdown opens/closes */
  onOpenChange?: (open: boolean) => void;

  /** Whether the dropdown is open (controlled) */
  open?: boolean;

  /** Whether the dropdown is disabled */
  disabled?: boolean;

  /** Additional className for the trigger button */
  className?: string;
};

export type SearchFilterBadgeProps = {
  count: number;
};

const SearchFilterBadge = ({ count }: SearchFilterBadgeProps) => (
  <span className="ml-0.5 px-1.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full min-w-5 h-5 inline-flex items-center justify-center">
    {count}
  </span>
);

const SearchFilterCheckIndicator = () => (
  <span
    className="ml-0.5 px-1.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full min-w-5 h-5 inline-flex items-center justify-center"
    aria-hidden="true"
  >
    <TypeIcon className="h-3 w-3" />
  </span>
);

export type SearchFilterChevronProps = {
  isOpen: boolean;
};

const SearchFilterChevron = ({ isOpen }: SearchFilterChevronProps) => (
  <ChevronDownIcon
    className={cn(
      "h-4 w-4 shrink-0 transition-transform duration-200",
      isOpen && "rotate-180",
    )}
    aria-hidden="true"
  />
);

const SearchFilterDropdown = React.forwardRef<
  HTMLButtonElement,
  SearchFilterDropdownProps & VariantProps<typeof searchFilterTriggerVariants>
>(
  (
    {
      label,
      isActive = false,
      activeCount,
      showDotIndicator = false,
      children,
      dropdownWidth = "auto",
      onOpenChange,
      open,
      disabled = false,
      className,
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    // Merge refs
    React.useImperativeHandle(
      ref,
      () => triggerRef.current as HTMLButtonElement,
    );

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const handleOpenChange = (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    };

    // Calculate content width
    const getContentStyle = (): React.CSSProperties => {
      if (dropdownWidth === "auto") {
        return { minWidth: "200px" };
      }
      if (dropdownWidth === "trigger") {
        return { width: triggerRef.current?.offsetWidth ?? "auto" };
      }
      return { width: `${dropdownWidth}px` };
    };

    return (
      <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            className={cn(searchFilterTriggerVariants({ isActive }), className)}
            data-slot="search-filter-trigger"
          >
            <span className="truncate">{label}</span>
            {isActive && showDotIndicator && <SearchFilterCheckIndicator />}
            {isActive &&
              !showDotIndicator &&
              activeCount !== undefined &&
              activeCount > 0 && <SearchFilterBadge count={activeCount} />}
            <SearchFilterChevron isOpen={isOpen} />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            sideOffset={4}
            align="start"
            className={cn(searchFilterContentVariants())}
            style={getContentStyle()}
            data-slot="search-filter-content"
          >
            {children}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);

SearchFilterDropdown.displayName = "SearchFilterDropdown";

export {
  SearchFilterDropdown,
  SearchFilterBadge,
  SearchFilterChevron,
  SearchFilterCheckIndicator,
  searchFilterTriggerVariants,
  searchFilterContentVariants,
};
