import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../../../styling/cn";

const toggleVariants = cva([
  // Layout & Sizing
  "peer inline-flex h-6 w-11 shrink-0",

  // Alignment
  "items-center",

  // Border & Shape
  "rounded-full border-2 border-transparent",

  // Cursor
  "cursor-pointer",

  // Visual Effects
  "shadow-xs outline-none",
  "transition-colors",

  // Unchecked State
  "bg-input",

  // Checked State
  "data-[state=checked]:bg-primary",

  // Focus State
  "focus-visible:border-ring",
  "focus-visible:ring-ring/50 focus-visible:ring-[3px]",

  // Disabled State
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
]);

const toggleThumbVariants = cva([
  // Layout & Sizing
  "pointer-events-none block size-5",

  // Shape
  "rounded-full",

  // Background
  "bg-background",

  // Visual Effects
  "shadow-lg ring-0",

  // Animation
  "transition-transform",

  // Position based on state
  "data-[state=unchecked]:translate-x-0",
  "data-[state=checked]:translate-x-5",
]);

export interface ToggleProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root>,
    VariantProps<typeof toggleVariants> {
  hasError?: boolean;
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  ToggleProps
>(({ className, hasError, ...props }, ref) => {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="toggle"
      className={cn(
        toggleVariants(),
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
      <SwitchPrimitive.Thumb
        data-slot="toggle-thumb"
        className={toggleThumbVariants()}
      />
    </SwitchPrimitive.Root>
  );
});

Toggle.displayName = "Toggle";

export { Toggle, toggleVariants, toggleThumbVariants };
