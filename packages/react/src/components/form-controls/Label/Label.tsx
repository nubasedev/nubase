import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../utils";

const labelVariants = cva("block text-sm font-medium text-onSurface", {
  variants: {
    variant: {
      default: "",
      required: "after:content-['*'] after:text-error after:ml-1",
      muted: "text-onSurfaceVariant font-normal",
    },
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, size, required, children, ...props }, ref) => {
    const finalVariant = required ? "required" : variant;

    return (
      <label
        ref={ref}
        className={cn(
          labelVariants({ variant: finalVariant, size }),
          className,
        )}
        {...props}
      >
        {children}
      </label>
    );
  },
);

Label.displayName = "Label";

export { Label, labelVariants };
