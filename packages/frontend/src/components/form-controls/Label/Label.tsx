import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../styling/cn";

const labelVariants = cva("block text-sm font-medium text-foreground", {
  variants: {
    variant: {
      default: "",
      required: "after:content-['*'] after:text-destructive after:ml-1",
      muted: "text-muted-foreground font-normal",
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
