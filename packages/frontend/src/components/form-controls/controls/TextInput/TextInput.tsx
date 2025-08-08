import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../../utils";

const inputVariants = cva(
  "w-full appearance-none bg-background border border-border rounded-md text-foreground text-sm leading-normal outline-none transition-all duration-200 placeholder:text-muted-foreground placeholder:opacity-40 focus:border-primary focus:ring-4 focus:ring-ring/10 disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-60 px-4 py-3",
  {
    variants: {
      hasError: {
        true: "border-destructive focus:border-destructive focus:ring-destructive/10",
        false: "",
      },
    },
    defaultVariants: {
      hasError: false,
    },
  },
);

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  hasError?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ hasError }), className)}
        {...props}
      />
    );
  },
);

TextInput.displayName = "TextInput";

export { TextInput, inputVariants };
