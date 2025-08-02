import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95 text-sm px-4 py-3 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-onPrimary hover:bg-primary/90 focus:ring-primary/20 shadow-sm",
        secondary:
          "bg-secondaryContainer text-onSecondaryContainer hover:bg-secondaryContainer/80 hover:border-outline/80 focus:ring-outline/20 shadow-sm",
        danger:
          "bg-error text-onError hover:bg-error/90 focus:ring-error/20 shadow-sm",
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
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
