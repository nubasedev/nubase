import * as React from "react";
import type { IconComponent } from "../../menu/types";
import { cn } from "../../styling/cn";
import { Card, CardContent, CardFooter } from "../card/Card";

interface WidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The title of the widget */
  title: string;
  /** Optional icon component (not instantiated) shown before the title */
  icon?: IconComponent;
  /** Optional action elements (e.g., buttons) shown on the right side of the header */
  action?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** The widget content */
  children: React.ReactNode;
}

/**
 * Widget is a pre-composed Card component for dashboard-style content.
 * It provides a compact header with title, optional icon, and action elements.
 * Widget always includes a border separator between header and content.
 * For layouts without the border, use the Card components directly.
 */
const Widget = React.forwardRef<HTMLDivElement, WidgetProps>(
  (
    { title, icon: Icon, action, footer, children, className, ...props },
    ref,
  ) => {
    return (
      <Card ref={ref} className={cn("pt-0", className)} {...props}>
        <div className="flex items-center gap-2 border-b px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            {Icon && <Icon className="h-[0.9rem] w-[0.9rem]" />}
            {title}
          </div>
          {action && (
            <div className="ml-auto flex items-center gap-2">{action}</div>
          )}
        </div>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {children}
        </CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    );
  },
);
Widget.displayName = "Widget";

export { Widget, type WidgetProps };
