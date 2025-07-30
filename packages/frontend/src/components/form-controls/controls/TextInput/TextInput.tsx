import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../../utils";

const inputVariants = cva(
  "w-full appearance-none bg-surface border border-outline rounded-md text-onSurface text-sm leading-normal outline-none transition-all duration-200 placeholder:text-onSurfaceVariant placeholder:opacity-40 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surfaceVariant disabled:cursor-not-allowed disabled:opacity-60 px-4 py-3",
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
