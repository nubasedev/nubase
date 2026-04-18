import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../styling/cn";

export type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Groups Buttons (or any interactive elements) into a single visually-joined
 * unit: inner borders collapse, outer corners stay rounded. Inspired by the
 * shadcn/ui button-group primitive.
 */
const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, children, role = "group", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={role}
        data-slot="button-group"
        className={cn(
          "inline-flex items-stretch",
          // Collapse shared borders between adjacent children
          "[&>*]:rounded-none",
          "[&>*:not(:first-child)]:-ml-px",
          // First and last children keep their outer rounding
          "[&>*:first-child]:rounded-l-md",
          "[&>*:last-child]:rounded-r-md",
          // Hovered/focused child should visually rise above neighbors
          "[&>*:hover]:z-10 [&>*:focus-visible]:z-10",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
