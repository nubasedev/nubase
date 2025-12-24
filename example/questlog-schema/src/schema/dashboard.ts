import {
  createKpiWidgetEndpoint,
  createProportionalWidgetEndpoint,
  createSeriesWidgetEndpoint,
  createTableWidgetEndpoint,
} from "@nubase/core";

/**
 * Dashboard widget endpoint schemas.
 * Each endpoint returns data in the format expected by its widget type.
 */

/** Revenue chart - returns series data for area/line/bar charts */
export const getRevenueChartSchema = createSeriesWidgetEndpoint(
  "/dashboard/revenue-chart",
);

/** Browser stats - returns proportional data for pie/donut charts */
export const getBrowserStatsSchema = createProportionalWidgetEndpoint(
  "/dashboard/browser-stats",
);

/** Total revenue KPI - returns single value with trend */
export const getTotalRevenueSchema = createKpiWidgetEndpoint(
  "/dashboard/total-revenue",
);

/** Active users KPI - returns single value with trend */
export const getActiveUsersSchema = createKpiWidgetEndpoint(
  "/dashboard/active-users",
);

/** Sales chart - returns series data for bar charts */
export const getSalesChartSchema = createSeriesWidgetEndpoint(
  "/dashboard/sales-chart",
);

/** Recent activity - returns table data */
export const getRecentActivitySchema = createTableWidgetEndpoint(
  "/dashboard/recent-activity",
);
