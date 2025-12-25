import { nu } from "./nu";
import type { Infer } from "./schema";

// =============================================================================
// SERIES DATA (for Line, Bar, Area charts)
// =============================================================================

/**
 * Configuration for series charts.
 * Defines which data keys represent the series and their display properties.
 */
export const seriesConfigSchema = nu.object({
  /** The data key field names that represent numeric series (e.g., ["desktop", "mobile"]) */
  keys: nu.array(nu.string()),
  /** Optional labels for each key (e.g., { desktop: "Desktop Users" }) */
  labels: nu.object({}).optional(),
  /** Optional colors for each key (e.g., { desktop: "var(--chart1)" }) */
  colors: nu.object({}).optional(),
});

/**
 * A single data point in a series chart.
 * The 'category' is the x-axis label (e.g., "January", "Q1", "2024-01").
 * Additional numeric fields are the data series values (e.g., desktop: 186, mobile: 80).
 *
 * Uses .catchall(nu.number()) to allow dynamic numeric fields beyond 'category'.
 */
export const seriesDataPointSchema = nu
  .object({
    category: nu.string(),
  })
  .catchall(nu.number());

/**
 * Complete series data response from an endpoint.
 * Used for Line, Bar, and Area charts.
 */
export const seriesDataSchema = nu.object({
  type: nu.string(), // "series"
  config: seriesConfigSchema,
  data: nu.array(seriesDataPointSchema),
});

export type SeriesConfig = Infer<typeof seriesConfigSchema>;
// The schema uses .catchall(nu.number()) for runtime validation of dynamic fields.
// TypeScript type is manually extended with Record<string, number> for type safety.
export type SeriesDataPoint = Infer<typeof seriesDataPointSchema> &
  Record<string, number>;
export type SeriesData = {
  type: "series";
  config: SeriesConfig;
  data: SeriesDataPoint[];
};

// =============================================================================
// PROPORTIONAL DATA (for Pie, Donut charts)
// =============================================================================

/**
 * A single segment in a proportional chart.
 * Note: Colors are automatically assigned by the frontend based on index.
 */
export const proportionalDataItemSchema = nu.object({
  label: nu.string(),
  value: nu.number(),
});

/**
 * Complete proportional data response from an endpoint.
 * Used for Pie and Donut charts.
 */
export const proportionalDataSchema = nu.object({
  type: nu.string(), // "proportional"
  data: nu.array(proportionalDataItemSchema),
});

export type ProportionalDataItem = Infer<typeof proportionalDataItemSchema>;
export type ProportionalData = {
  type: "proportional";
  data: Array<ProportionalDataItem & { fill?: string }>;
};

// =============================================================================
// KPI DATA (single value display)
// =============================================================================

/**
 * KPI/stat widget data for displaying a single metric.
 */
export const kpiDataSchema = nu.object({
  type: nu.string(), // "kpi"
  value: nu.string(),
  label: nu.string().optional(),
  trend: nu.string().optional(),
  trendDirection: nu.string().optional(), // "up" | "down" | "neutral"
});

export type KpiData = {
  type: "kpi";
  value: string;
  label?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
};

// =============================================================================
// TABLE DATA (rows of data)
// =============================================================================

/**
 * Column definition for table widgets.
 */
export const tableColumnSchema = nu.object({
  key: nu.string(),
  label: nu.string(),
  width: nu.string().optional(),
});

/**
 * Complete table data response from an endpoint.
 */
export const tableDataSchema = nu.object({
  type: nu.string(), // "table"
  columns: nu.array(tableColumnSchema),
  rows: nu.array(nu.object({})), // Record<string, unknown>[]
});

export type TableColumn = Infer<typeof tableColumnSchema>;
export type TableData = {
  type: "table";
  columns: TableColumn[];
  rows: Record<string, unknown>[];
};

// =============================================================================
// WIDGET DATA UNION
// =============================================================================

/**
 * Union of all possible widget data types.
 */
export type WidgetData = SeriesData | ProportionalData | KpiData | TableData;

/**
 * Widget data type discriminator.
 */
export type WidgetDataType = "series" | "proportional" | "kpi" | "table";
