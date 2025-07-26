import { IconSearch } from "@tabler/icons-react";
import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../utils";

const searchInputVariants = cva(
  "w-full appearance-none bg-surface border border-outline rounded-md text-onSurface text-sm leading-normal outline-none transition-all duration-200 placeholder:text-onSurfaceVariant focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surfaceVariant disabled:cursor-not-allowed disabled:opacity-60 px-4 py-3 pl-10",
  {
    variants: {
      hasError: {
        true: "border-error focus:border-error focus:ring-error/10",
        false: "",
      },
    },
    defaultVariants: {
      hasError: false,
    },
  },
);

export interface SearchTextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof searchInputVariants> {
  hasError?: boolean;
}

const SearchTextInput = forwardRef<HTMLInputElement, SearchTextInputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          type="search"
          className={cn(searchInputVariants({ hasError }), className)}
          {...props}
        />
        <div className="absolute top-1/2 left-3 transform -translate-y-1/2 text-onSurfaceVariant pointer-events-none">
          <IconSearch className="h-4 w-4" />
        </div>
      </div>
    );
  },
);

SearchTextInput.displayName = "SearchTextInput";

export { SearchTextInput, searchInputVariants };
