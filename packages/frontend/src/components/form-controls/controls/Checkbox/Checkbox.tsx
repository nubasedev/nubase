import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../../../styling/cn";

const checkboxVariants = cva([
  // Layout & Sizing
  "peer size-4 shrink-0",

  // Border & Shape
  "border border-input rounded-[4px]",

  // Background
  "dark:bg-input/30",

  // Visual Effects
  "shadow-xs outline-none",
  "transition-shadow",

  // Checked State
  "data-[state=checked]:bg-primary",
  "data-[state=checked]:text-primary-foreground",
  "data-[state=checked]:border-primary",
  "dark:data-[state=checked]:bg-primary",

  // Focus State
  "focus-visible:border-ring",
  "focus-visible:ring-ring/50 focus-visible:ring-[3px]",

  // Disabled State
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
]);

const checkboxIndicatorVariants = cva([
  // Layout
  "flex items-center justify-center",

  // Text
  "text-current",

  // Animation
  "transition-none",
]);

export interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  hasError?: boolean;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, hasError, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        checkboxVariants(),
        hasError && [
          "border-destructive",
          "ring-destructive/20",
          "aria-invalid:border-destructive",
          "aria-invalid:ring-destructive/20",
          "dark:aria-invalid:ring-destructive/40",
        ],
        className,
      )}
      aria-invalid={hasError}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={checkboxIndicatorVariants()}
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox, checkboxVariants };
