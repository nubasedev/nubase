import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { Children, Fragment, forwardRef } from "react";
import { cn } from "../../../styling/cn";

const actionBarVariants = cva("flex items-center", {
  variants: {
    variant: {
      // Groups separated by spacing; each group keeps its joined borders.
      default: "gap-2",
      // Borderless groups separated by a thin vertical divider.
      ghost: "gap-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type ActionBarProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof actionBarVariants>;

/**
 * Presentational toolbar that lays out groups of buttons. Each top-level child
 * is treated as one group (typically a `<ButtonGroup>`). The `ghost` variant
 * draws a thin vertical divider between groups instead of relying on spacing
 * alone. Framework-agnostic — pass any buttons/groups as children.
 */
const ActionBar = forwardRef<HTMLDivElement, ActionBarProps>(
  ({ className, children, role = "toolbar", variant, ...props }, ref) => {
    const groups = Children.toArray(children);

    return (
      <div
        ref={ref}
        role={role}
        data-component="ActionBar"
        className={cn(actionBarVariants({ variant }), className)}
        {...props}
      >
        {groups.map((group, index) => (
          <Fragment key={index}>
            {variant === "ghost" && index > 0 && (
              <div aria-hidden className="h-4 w-px self-center bg-border" />
            )}
            {group}
          </Fragment>
        ))}
      </div>
    );
  },
);

ActionBar.displayName = "ActionBar";

export { ActionBar, actionBarVariants };
