import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../utils";

const buttonBarVariants = cva("flex gap-2 p-3", {
  variants: {
    alignment: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
    variant: {
      default: "bg-surfaceVariant",
      transparent: "",
    },
  },
  defaultVariants: {
    alignment: "right",
    variant: "default",
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
