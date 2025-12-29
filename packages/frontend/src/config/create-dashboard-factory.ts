import type { IconComponent } from "../menu/types";
import type {
  DashboardDescriptor,
  DashboardGridConfig,
  WidgetDescriptor,
} from "./dashboard-widget";

/**
 * Dashboard builder that enables chained, type-safe dashboard configuration.
 *
 * The builder pattern enables sequential type inference, solving the circular
 * dependency problem between API endpoints and widget configurations.
 *
 * @example
 * ```typescript
 * const analyticsDashboard = createDashboard("analytics")
 *   .withApiEndpoints(apiEndpoints)
 *   .withTitle("Analytics Dashboard")
 *   .withWidgets([
 *     {
 *       type: "series",
 *       id: "revenue-chart",
 *       title: "Revenue Trend",
 *       variant: "area",
 *       onLoad: async ({ context }) => {
 *         return context.http.getRevenueChart({ params: {} });
 *       },
 *       defaultLayout: { x: 0, y: 0, w: 8, h: 3 },
 *     },
 *     {
 *       type: "kpi",
 *       id: "total-revenue",
 *       title: "Total Revenue",
 *       onLoad: async ({ context }) => {
 *         return context.http.getTotalRevenue({ params: {} });
 *       },
 *       defaultLayout: { x: 8, y: 0, w: 4, h: 2 },
 *     },
 *   ]);
 * ```
 */
class DashboardBuilder<TId extends string, TApiEndpoints = never> {
  private config: {
    id: TId;
    title?: string;
    icon?: IconComponent;
    apiEndpoints?: TApiEndpoints;
    gridConfig?: DashboardGridConfig;
  };

  constructor(id: TId) {
    this.config = { id };
  }

  /**
   * Configure API endpoints for type-safe widget data fetching.
   * This must be called before withWidgets() to enable type checking.
   */
  withApiEndpoints<T>(apiEndpoints: T): DashboardBuilder<TId, T> {
    const builder = new DashboardBuilder<TId, T>(this.config.id);
    builder.config.title = this.config.title;
    builder.config.icon = this.config.icon;
    builder.config.apiEndpoints = apiEndpoints;
    builder.config.gridConfig = this.config.gridConfig;
    return builder;
  }

  /**
   * Set the dashboard title.
   */
  withTitle(title: string): this {
    this.config.title = title;
    return this;
  }

  /**
   * Set the dashboard icon.
   */
  withIcon(icon: IconComponent): this {
    this.config.icon = icon;
    return this;
  }

  /**
   * Configure grid layout options.
   */
  withGridConfig(gridConfig: DashboardGridConfig): this {
    this.config.gridConfig = gridConfig;
    return this;
  }

  /**
   * Configure widgets for this dashboard.
   * This is the final step that produces the DashboardDescriptor.
   *
   * Each widget must provide an `onLoad` callback that fetches data
   * using `context.http` for type-safe API calls.
   */
  withWidgets(
    widgets: WidgetDescriptor<TApiEndpoints>[],
  ): DashboardDescriptor<TApiEndpoints> {
    return {
      id: this.config.id,
      title: this.config.title || this.config.id,
      icon: this.config.icon,
      widgets,
      gridConfig: this.config.gridConfig,
    };
  }
}

/**
 * Creates a new dashboard builder with the specified ID.
 *
 * The builder pattern enables sequential type inference:
 * 1. First, call `.withApiEndpoints(apiEndpoints)` to provide the API type context
 * 2. Then, configure the dashboard with `.withTitle()`, `.withGridConfig()`, etc.
 * 3. Finally, call `.withWidgets([...])` to define the widgets with `onLoad` callbacks
 *
 * @param id Unique identifier for the dashboard
 * @returns A DashboardBuilder instance
 *
 * @example
 * ```typescript
 * import { apiEndpoints } from "schema";
 *
 * const salesDashboard = createDashboard("sales")
 *   .withApiEndpoints(apiEndpoints)
 *   .withTitle("Sales Dashboard")
 *   .withGridConfig({ rowHeight: 100 })
 *   .withWidgets([
 *     {
 *       type: "series",
 *       id: "revenue",
 *       title: "Revenue",
 *       variant: "area",
 *       onLoad: async ({ context }) => {
 *         return context.http.getRevenueChart({ params: {} });
 *       },
 *       defaultLayout: { x: 0, y: 0, w: 8, h: 3 },
 *     },
 *   ]);
 * ```
 */
export function createDashboard<TId extends string>(
  id: TId,
): DashboardBuilder<TId, never> {
  return new DashboardBuilder(id);
}
