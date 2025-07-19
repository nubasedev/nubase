import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../utils";

const searchInputVariants = cva(
  "w-full appearance-none bg-surface border border-border rounded-md text-text text-sm leading-normal outline-none transition-all duration-200 placeholder:text-text-placeholder focus:border-border-focus focus:ring-4 focus:ring-primary/10 disabled:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 pl-10",
  {
    variants: {
      size: {
        sm: "px-3 py-2 text-xs pl-8",
        md: "px-4 py-3 text-sm pl-10",
        lg: "px-4 py-4 text-base pl-12",
      },
      hasError: {
        true: "border-border-error focus:border-border-error focus:ring-error/10",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
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
  ({ className, size, hasError, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          type="search"
          className={cn(searchInputVariants({ size, hasError }), className)}
          {...props}
        />
        <div className={cn(
          "absolute top-1/2 transform -translate-y-1/2 text-text-placeholder pointer-events-none",
          size === "sm" ? "left-2" : size === "lg" ? "left-4" : "left-3"
        )}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Search"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>
    );
  },
);

SearchTextInput.displayName = "SearchTextInput";

export { SearchTextInput, searchInputVariants };