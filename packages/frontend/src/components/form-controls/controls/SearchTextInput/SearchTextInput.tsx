import { cva, type VariantProps } from "class-variance-authority";
import { Search } from "lucide-react";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../../styling/cn";

const searchTextInputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent pl-10 pr-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
);

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
