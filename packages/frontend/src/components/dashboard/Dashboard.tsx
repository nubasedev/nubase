import type * as React from "react";
import ReactGridLayout, {
  type Layout,
  type LayoutItem,
  useContainerWidth,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { DashboardGridConfig } from "../../config/dashboard-widget";
import { cn } from "../../styling/cn";

export type { LayoutItem, Layout };
// Re-export for backwards compatibility
export type { DashboardGridConfig };

export interface DashboardDragConfig {
  /** Enable dragging */
  enabled?: boolean;
  /** CSS selector for drag handle */
  handle?: string;
  /** CSS selector for elements that should not trigger drag */
  cancel?: string;
}

export interface DashboardResizeConfig {
  /** Enable resizing */
  enabled?: boolean;
  /** Which handles to show for resizing */
  handles?: Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">;
}

export interface DashboardProps {
  /** The layout configuration for grid items */
  layout: Layout;
  /** Callback when layout changes */
  onLayoutChange?: (layout: Layout) => void;
  /** Grid configuration */
  gridConfig?: DashboardGridConfig;
  /** Drag configuration */
  dragConfig?: DashboardDragConfig;
  /** Resize configuration */
  resizeConfig?: DashboardResizeConfig;
  /** Additional class name for the dashboard container */
  className?: string;
  /** Dashboard widget children */
  children: React.ReactNode;
}

const defaultGridConfig: Required<DashboardGridConfig> = {
  cols: 12,
  rowHeight: 100,
  margin: [16, 16],
  containerPadding: [0, 0],
};

const defaultDragConfig: Required<DashboardDragConfig> = {
  enabled: true,
  handle: ".dashboard-widget-drag-handle",
  cancel: ".dashboard-widget-no-drag",
};

const defaultResizeConfig: Required<DashboardResizeConfig> = {
  enabled: true,
  handles: ["se"],
};

/**
 * Dashboard is a grid layout container for DashboardWidget components.
 * It uses react-grid-layout internally for drag-and-drop and resizing functionality.
 */
export function Dashboard({
  layout,
  onLayoutChange,
  gridConfig: gridConfigProp,
  dragConfig: dragConfigProp,
  resizeConfig: resizeConfigProp,
  className,
  children,
}: DashboardProps) {
  const { width, containerRef, mounted } = useContainerWidth();

  const gridConfig = { ...defaultGridConfig, ...gridConfigProp };
  const dragConfig = { ...defaultDragConfig, ...dragConfigProp };
  const resizeConfig = { ...defaultResizeConfig, ...resizeConfigProp };

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          gridConfig={{
            cols: gridConfig.cols,
            rowHeight: gridConfig.rowHeight,
            margin: gridConfig.margin,
            containerPadding: gridConfig.containerPadding,
          }}
          dragConfig={{
            enabled: dragConfig.enabled,
            handle: dragConfig.handle,
            cancel: dragConfig.cancel,
          }}
          resizeConfig={{
            enabled: resizeConfig.enabled,
            handles: resizeConfig.handles,
          }}
          onLayoutChange={onLayoutChange}
        >
          {children}
        </ReactGridLayout>
      )}
    </div>
  );
}
