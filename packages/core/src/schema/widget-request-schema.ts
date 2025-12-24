import { emptySchema } from "./empty-schema";
import type { ObjectSchema } from "./schema";
import {
  kpiDataSchema,
  proportionalDataSchema,
  seriesDataSchema,
  tableDataSchema,
} from "./widget-data-schema";

/**
 * Type for a series widget endpoint that preserves the responseBody type.
 */
export type SeriesWidgetRequestSchema = {
  method: "GET";
  path: string;
  requestParams: ObjectSchema<any>;
  responseBody: typeof seriesDataSchema;
};

/**
 * Type for a proportional widget endpoint that preserves the responseBody type.
 */
export type ProportionalWidgetRequestSchema = {
  method: "GET";
  path: string;
  requestParams: ObjectSchema<any>;
  responseBody: typeof proportionalDataSchema;
};

/**
 * Type for a KPI widget endpoint that preserves the responseBody type.
 */
export type KpiWidgetRequestSchema = {
  method: "GET";
  path: string;
  requestParams: ObjectSchema<any>;
  responseBody: typeof kpiDataSchema;
};

/**
 * Type for a table widget endpoint that preserves the responseBody type.
 */
export type TableWidgetRequestSchema = {
  method: "GET";
  path: string;
  requestParams: ObjectSchema<any>;
  responseBody: typeof tableDataSchema;
};

/**
 * Creates a RequestSchema for a Series widget endpoint.
 * The response conforms to SeriesData shape.
 *
 * @param path The API endpoint path (e.g., "/dashboard/revenue")
 * @param requestParams Optional request parameters schema
 * @returns A RequestSchema configured for series data
 *
 * @example
 * ```typescript
 * export const getRevenueChartSchema = createSeriesWidgetEndpoint("/dashboard/revenue");
 * ```
 */
export function createSeriesWidgetEndpoint(
  path: string,
  requestParams?: ObjectSchema<any>,
): SeriesWidgetRequestSchema {
  return {
    method: "GET",
    path,
    requestParams: requestParams || emptySchema,
    responseBody: seriesDataSchema,
  };
}

/**
 * Creates a RequestSchema for a Proportional widget endpoint.
 * The response conforms to ProportionalData shape.
 *
 * @param path The API endpoint path (e.g., "/dashboard/browser-stats")
 * @param requestParams Optional request parameters schema
 * @returns A RequestSchema configured for proportional data
 *
 * @example
 * ```typescript
 * export const getBrowserStatsSchema = createProportionalWidgetEndpoint("/dashboard/browsers");
 * ```
 */
export function createProportionalWidgetEndpoint(
  path: string,
  requestParams?: ObjectSchema<any>,
): ProportionalWidgetRequestSchema {
  return {
    method: "GET",
    path,
    requestParams: requestParams || emptySchema,
    responseBody: proportionalDataSchema,
  };
}

/**
 * Creates a RequestSchema for a KPI widget endpoint.
 * The response conforms to KpiData shape.
 *
 * @param path The API endpoint path (e.g., "/dashboard/total-revenue")
 * @param requestParams Optional request parameters schema
 * @returns A RequestSchema configured for KPI data
 *
 * @example
 * ```typescript
 * export const getTotalRevenueSchema = createKpiWidgetEndpoint("/dashboard/total-revenue");
 * ```
 */
export function createKpiWidgetEndpoint(
  path: string,
  requestParams?: ObjectSchema<any>,
): KpiWidgetRequestSchema {
  return {
    method: "GET",
    path,
    requestParams: requestParams || emptySchema,
    responseBody: kpiDataSchema,
  };
}

/**
 * Creates a RequestSchema for a Table widget endpoint.
 * The response conforms to TableData shape.
 *
 * @param path The API endpoint path (e.g., "/dashboard/recent-orders")
 * @param requestParams Optional request parameters schema
 * @returns A RequestSchema configured for table data
 *
 * @example
 * ```typescript
 * export const getRecentOrdersSchema = createTableWidgetEndpoint("/dashboard/orders");
 * ```
 */
export function createTableWidgetEndpoint(
  path: string,
  requestParams?: ObjectSchema<any>,
): TableWidgetRequestSchema {
  return {
    method: "GET",
    path,
    requestParams: requestParams || emptySchema,
    responseBody: tableDataSchema,
  };
}
