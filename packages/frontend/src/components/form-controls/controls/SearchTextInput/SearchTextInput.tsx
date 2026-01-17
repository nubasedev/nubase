import { cva, type VariantProps } from "class-variance-authority";
import { Search } from "lucide-react";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../../styling/cn";

const searchTextInputVariants = cva([
  // Layout & Sizing
  "flex h-9 w-full min-w-0",

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

export interface SearchTextInputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof searchTextInputVariants> {
  hasError?: boolean;
}

const SearchTextInput = forwardRef<HTMLInputElement, SearchTextInputProps>(
  ({ className, type = "search", hasError, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          type={type}
          data-slot="input"
          aria-invalid={hasError}
          className={cn(searchTextInputVariants({ className }))}
          {...props}
        />
        <div className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Search className="h-4 w-4" />
        </div>
      </div>
    );
  },
);

SearchTextInput.displayName = "SearchTextInput";

export { SearchTextInput, searchTextInputVariants };
