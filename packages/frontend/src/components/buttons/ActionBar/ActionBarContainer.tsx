import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../styling/cn";

const actionBarContainerVariants = cva(
  "bg-card border-border rounded-lg border p-3",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ActionBarContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof actionBarContainerVariants> {}

const ActionBarContainer = forwardRef<HTMLDivElement, ActionBarContainerProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div
        className={cn(actionBarContainerVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ActionBarContainer.displayName = "ActionBarContainer";

export { ActionBarContainer, actionBarContainerVariants };
