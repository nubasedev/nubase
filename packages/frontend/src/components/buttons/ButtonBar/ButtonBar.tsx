import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../styling/cn";

const buttonBarVariants = cva("flex gap-3 p-3", {
  variants: {
    alignment: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
    variant: {
      transparent: "",
      muted: "bg-muted rounded-lg",
    },
  },
  defaultVariants: {
    alignment: "right",
    variant: "transparent",
  },
});

export interface ButtonBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonBarVariants> {}

const ButtonBar = forwardRef<HTMLDivElement, ButtonBarProps>(
  ({ className, alignment, variant, children, ...props }, ref) => {
    return (
      <div
        className={cn(buttonBarVariants({ alignment, variant }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ButtonBar.displayName = "ButtonBar";

export { ButtonBar, buttonBarVariants };
