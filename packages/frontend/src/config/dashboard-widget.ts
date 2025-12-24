import type {
  KpiWidgetRequestSchema,
  ProportionalWidgetRequestSchema,
  SeriesWidgetRequestSchema,
  TableWidgetRequestSchema,
} from "@nubase/core";
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
// TYPE-SAFE ENDPOINT EXTRACTION
// =============================================================================

/**
 * Extract endpoint keys that return SeriesData.
 * Matches endpoints created with createSeriesWidgetEndpoint.
 */
type SeriesEndpointKeys<TApiEndpoints> = {
  [K in keyof TApiEndpoints]: TApiEndpoints[K] extends SeriesWidgetRequestSchema
    ? K
    : never;
}[keyof TApiEndpoints];

/**
 * Extract endpoint keys that return ProportionalData.
 * Matches endpoints created with createProportionalWidgetEndpoint.
 */
type ProportionalEndpointKeys<TApiEndpoints> = {
  [K in keyof TApiEndpoints]: TApiEndpoints[K] extends ProportionalWidgetRequestSchema
    ? K
    : never;
}[keyof TApiEndpoints];

/**
 * Extract endpoint keys that return KpiData.
 * Matches endpoints created with createKpiWidgetEndpoint.
 */
type KpiEndpointKeys<TApiEndpoints> = {
  [K in keyof TApiEndpoints]: TApiEndpoints[K] extends KpiWidgetRequestSchema
    ? K
    : never;
}[keyof TApiEndpoints];

/**
 * Extract endpoint keys that return TableData.
 * Matches endpoints created with createTableWidgetEndpoint.
 */
type TableEndpointKeys<TApiEndpoints> = {
  [K in keyof TApiEndpoints]: TApiEndpoints[K] extends TableWidgetRequestSchema
    ? K
    : never;
}[keyof TApiEndpoints];

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
   * The API endpoint key that provides data for this widget.
   * TypeScript will only allow endpoints that return SeriesData.
   */
  endpoint: SeriesEndpointKeys<TApiEndpoints>;
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
   * The API endpoint key that provides data for this widget.
   * TypeScript will only allow endpoints that return ProportionalData.
   */
  endpoint: ProportionalEndpointKeys<TApiEndpoints>;
}

// =============================================================================
// KPI WIDGET
// =============================================================================

export interface KpiWidgetDescriptor<TApiEndpoints>
  extends BaseWidgetDescriptor {
  type: "kpi";
  /**
   * The API endpoint key that provides data for this widget.
   * TypeScript will only allow endpoints that return KpiData.
   */
  endpoint: KpiEndpointKeys<TApiEndpoints>;
}

// =============================================================================
// TABLE WIDGET
// =============================================================================

export interface TableWidgetDescriptor<TApiEndpoints>
  extends BaseWidgetDescriptor {
  type: "table";
  /**
   * The API endpoint key that provides data for this widget.
   * TypeScript will only allow endpoints that return TableData.
   */
  endpoint: TableEndpointKeys<TApiEndpoints>;
  /** Maximum rows to display */
  maxRows?: number;
}

// =============================================================================
// WIDGET DESCRIPTOR UNION
// =============================================================================

/**
 * Union of all widget descriptor types.
 * Each widget type enforces that its endpoint returns the correct data shape.
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
