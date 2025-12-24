import { GripVertical } from "lucide-react";
import * as React from "react";
import type { IconComponent } from "../../menu/types";
import { cn } from "../../styling/cn";
import { Card, CardContent, CardFooter } from "../card/Card";

export interface DashboardWidgetProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The title of the widget */
  title: string;
  /** Optional icon component (not instantiated) shown before the title */
  icon?: IconComponent;
  /** Optional action elements (e.g., buttons) shown on the right side of the header */
  action?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Whether the widget is draggable (shows drag handle) */
  draggable?: boolean;
  /** The widget content */
  children: React.ReactNode;
}

/**
 * DashboardWidget is a Widget component adapted for use inside a Dashboard.
 * It includes a drag handle for repositioning within the grid layout.
 */
export const DashboardWidget = React.forwardRef<
  HTMLDivElement,
  DashboardWidgetProps
>(
  (
    {
      title,
      icon: Icon,
      action,
      footer,
      draggable = true,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <Card
        ref={ref}
        className={cn("flex h-full flex-col pt-0", className)}
        {...props}
      >
        <div className="flex items-center gap-2 border-b px-3 py-2.5">
          {draggable && (
            <div className="dashboard-widget-drag-handle cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing">
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            {Icon && <Icon className="h-[0.9rem] w-[0.9rem]" />}
            {title}
          </div>
          {action && (
            <div className="dashboard-widget-no-drag ml-auto flex items-center gap-2">
              {action}
            </div>
          )}
        </div>
        <CardContent className="flex-1 overflow-auto px-2 pt-4 sm:px-6 sm:pt-6">
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="dashboard-widget-no-drag">{footer}</CardFooter>
        )}
      </Card>
    );
  },
);
DashboardWidget.displayName = "DashboardWidget";
