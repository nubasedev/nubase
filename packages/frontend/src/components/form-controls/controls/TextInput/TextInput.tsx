import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/styling/cn";

const textInputVariants = cva([
  // Layout & Sizing
  "flex h-9 w-full min-w-0",

  // Spacing & Borders
  "px-3 py-1 rounded-md border border-input",

  // Background & Text
  "bg-transparent text-base",
  "dark:bg-input/30",

  // Visual Effects
  "shadow-xs outline-none",
  "transition-[color,box-shadow]",

  // Placeholder & Selection
  "placeholder:text-muted-foreground",
  "selection:bg-primary selection:text-primary-foreground",

  // Focus State
  "focus-visible:border-ring",
  "focus-visible:ring-ring/50",

  // Invalid State
  "aria-invalid:border-destructive",
  "aria-invalid:ring-destructive/20",
  "dark:aria-invalid:ring-destructive/40",

  // Disabled State
  "disabled:pointer-events-none",
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
]);

export interface TextInputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof textInputVariants> {
  hasError?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, type, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        aria-invalid={hasError}
        className={cn(textInputVariants({ className }))}
        {...props}
      />
    );
  },
);

TextInput.displayName = "TextInput";

export { TextInput, textInputVariants };
