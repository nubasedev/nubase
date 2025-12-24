import * as React from "react";
import type { DashboardDescriptor } from "../../config/dashboard-widget";
import { ConnectedWidget } from "./ConnectedWidget";
import { Dashboard, type Layout } from "./Dashboard";

export interface DashboardRendererProps {
  /** The dashboard descriptor to render */
  dashboard: DashboardDescriptor<any>;
  /** Optional controlled layout state */
  layout?: Layout;
  /** Callback when layout changes */
  onLayoutChange?: (layout: Layout) => void;
  /** Additional class name for the dashboard container */
  className?: string;
}

/**
 * Renders a complete dashboard from a DashboardDescriptor configuration.
 *
 * This component:
 * 1. Generates the layout from widget configurations
 * 2. Renders each widget as a ConnectedWidget (which handles data fetching)
 * 3. Manages layout state (controlled or uncontrolled)
 *
 * @example
 * ```tsx
 * import { analyticsDashboard } from "./dashboards/analytics";
 *
 * function AnalyticsPage() {
 *   return (
 *     <div className="p-4">
 *       <DashboardRenderer dashboard={analyticsDashboard} />
 *     </div>
 *   );
 * }
 * ```
 */
export function DashboardRenderer({
  dashboard,
  layout: controlledLayout,
  onLayoutChange,
  className,
}: DashboardRendererProps) {
  const [internalLayout, setInternalLayout] = React.useState<Layout>(() =>
    generateDefaultLayout(dashboard),
  );

  const layout = controlledLayout ?? internalLayout;
  const handleLayoutChange = onLayoutChange ?? setInternalLayout;

  return (
    <Dashboard
      layout={layout}
      onLayoutChange={handleLayoutChange}
      gridConfig={dashboard.gridConfig}
      className={className}
    >
      {dashboard.widgets.map((widget) => (
        <div key={widget.id}>
          <ConnectedWidget widget={widget} />
        </div>
      ))}
    </Dashboard>
  );
}

/**
 * Generates the default layout from widget configurations.
 * Uses each widget's defaultLayout if specified, otherwise auto-positions.
 */
function generateDefaultLayout(dashboard: DashboardDescriptor<any>): Layout {
  return dashboard.widgets.map((widget, index) => ({
    i: widget.id,
    x: widget.defaultLayout?.x ?? (index % 3) * 4,
    y: widget.defaultLayout?.y ?? Math.floor(index / 3) * 3,
    w: widget.defaultLayout?.w ?? 4,
    h: widget.defaultLayout?.h ?? 3,
    minW: widget.defaultLayout?.minW,
    minH: widget.defaultLayout?.minH,
    maxW: widget.defaultLayout?.maxW,
    maxH: widget.defaultLayout?.maxH,
    static: widget.defaultLayout?.static,
  }));
}
