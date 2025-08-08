import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../utils";
import { ActivityIndicator } from "../../activity-indicator";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95 text-sm px-4 py-3 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring/20 shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:border-border/80 focus:ring-ring/20 shadow-sm",
        danger:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/20 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <ActivityIndicator
            size="sm"
            color="inherit"
            aria-label="Loading..."
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
