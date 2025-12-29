import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";
import type { IconComponent } from "../menu/types";

// =============================================================================
// CHART VARIANTS
// =============================================================================

export type SeriesChartVariant = "line" | "bar" | "area";
export type ProportionalChartVariant = "pie" | "donut";

// =============================================================================
// LAYOUT CONFIGURATION
// =============================================================================

export interface WidgetLayoutConfig {
  /** Column position (0-based) */
  x: number;
  /** Row position (0-based) */
  y: number;
  /** Width in grid columns */
  w: number;
  /** Height in grid rows */
  h: number;
  /** Minimum width in grid columns */
  minW?: number;
  /** Minimum height in grid rows */
  minH?: number;
  /** Maximum width in grid columns */
  maxW?: number;
  /** Maximum height in grid rows */
  maxH?: number;
  /** Whether the widget cannot be moved or resized */
  static?: boolean;
}

// =============================================================================
// BASE WIDGET DESCRIPTOR
// =============================================================================

export interface BaseWidgetDescriptor {
  /** Unique identifier for this widget */
  id: string;
  /** Display title for the widget header */
  title: string;
  /** Optional icon for the widget header */
  icon?: IconComponent;
  /** Default grid layout position and size */
  defaultLayout?: WidgetLayoutConfig;
  /** Optional refresh interval in milliseconds */
  refreshInterval?: number;
}

// =============================================================================
// SERIES WIDGET
// =============================================================================

export interface SeriesWidgetDescriptor<TApiEndpoints>
  extends BaseWidgetDescriptor {
  type: "series";
  /** The chart variant to render */
  variant: SeriesChartVariant;
  /**
   * Loads the series data for this widget.
   * Called when the widget mounts and on refresh.
   */
  onLoad: (args: {
    context: NubaseContextData<TApiEndpoints>;
  }) => Promise<HttpResponse<any>>;
}

// =============================================================================
// PROPORTIONAL WIDGET
// =============================================================================

export interface ProportionalWidgetDescriptor<TApiEndpoints>
  extends BaseWidgetDescriptor {
  type: "proportional";
  /** The chart variant to render */
  variant: ProportionalChartVariant;
  /**
   * Loads the proportional data for this widget.
   * Called when the widget mounts and on refresh.
   */
  onLoad: (args: {
    context: NubaseContextData<TApiEndpoints>;
  }) => Promise<HttpResponse<any>>;
}

// =============================================================================
// KPI WIDGET
// =============================================================================

export interface KpiWidgetDescriptor<TApiEndpoints>
  extends BaseWidgetDescriptor {
  type: "kpi";
  /**
   * Loads the KPI data for this widget.
   * Called when the widget mounts and on refresh.
   */
  onLoad: (args: {
    context: NubaseContextData<TApiEndpoints>;
  }) => Promise<HttpResponse<any>>;
}

// =============================================================================
// TABLE WIDGET
// =============================================================================

export interface TableWidgetDescriptor<TApiEndpoints>
  extends BaseWidgetDescriptor {
  type: "table";
  /** Maximum rows to display */
  maxRows?: number;
  /**
   * Loads the table data for this widget.
   * Called when the widget mounts and on refresh.
   */
  onLoad: (args: {
    context: NubaseContextData<TApiEndpoints>;
  }) => Promise<HttpResponse<any>>;
}

// =============================================================================
// WIDGET DESCRIPTOR UNION
// =============================================================================

/**
 * Union of all widget descriptor types.
 * Each widget type uses an onLoad callback for data fetching.
 */
export type WidgetDescriptor<TApiEndpoints> =
  | SeriesWidgetDescriptor<TApiEndpoints>
  | ProportionalWidgetDescriptor<TApiEndpoints>
  | KpiWidgetDescriptor<TApiEndpoints>
  | TableWidgetDescriptor<TApiEndpoints>;

// =============================================================================
// DASHBOARD DESCRIPTOR
// =============================================================================

export interface DashboardGridConfig {
  /** Number of columns in the grid */
  cols?: number;
  /** Height of a single row in pixels */
  rowHeight?: number;
  /** Margin between items [horizontal, vertical] in pixels */
  margin?: [number, number];
  /** Container padding [horizontal, vertical] in pixels */
  containerPadding?: [number, number];
}

export interface DashboardDescriptor<TApiEndpoints> {
  /** Unique identifier for this dashboard */
  id: string;
  /** Display title for the dashboard */
  title: string;
  /** Optional icon for the dashboard */
  icon?: IconComponent;
  /** Widget configurations for this dashboard */
  widgets: WidgetDescriptor<TApiEndpoints>[];
  /** Optional grid configuration */
  gridConfig?: DashboardGridConfig;
}
