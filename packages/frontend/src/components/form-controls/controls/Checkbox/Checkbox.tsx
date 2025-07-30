import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../../utils";

const checkboxVariants = cva(
  "w-4 h-4 rounded border bg-surface text-primary transition-all duration-200 cursor-pointer focus:ring-4 focus:ring-primary/10 disabled:bg-surfaceVariant disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      hasError: {
        true: "border-error focus:ring-error/10",
        false: "border-outline",
      },
    },
    defaultVariants: {
      hasError: false,
    },
  },
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
    VariantProps<typeof checkboxVariants> {
  hasError?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(checkboxVariants({ hasError }), className)}
        {...props}
      />
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox, checkboxVariants };
