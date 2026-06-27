import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../styling/cn";

const buttonGroupVariants = cva("inline-flex items-stretch", {
  variants: {
    variant: {
      // Joined unit: inner borders collapse, outer corners stay rounded.
      default: [
        "[&>*]:rounded-none",
        "[&>*:not(:first-child)]:-ml-px",
        "[&>*:first-child]:rounded-l-md",
        "[&>*:last-child]:rounded-r-md",
        "[&>*:hover]:z-10 [&>*:focus-visible]:z-10",
      ],
      // Borderless buttons sitting adjacent; each keeps its own rounded hover
      // background. Group boundaries are drawn by the parent (e.g. ActionBar).
      ghost: [],
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof buttonGroupVariants>;

/**
 * Groups Buttons (or any interactive elements) into a single unit. The
 * `default` variant collapses inner borders while keeping outer corners
 * rounded; the `ghost` variant drops the borders entirely so borderless
 * buttons sit adjacent. Inspired by the shadcn/ui button-group primitive.
 */
const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, children, role = "group", variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={role}
        data-slot="button-group"
        className={cn(buttonGroupVariants({ variant }), className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup, buttonGroupVariants };
