import { createSeriesWidgetEndpoint } from "@nubase/core";

/** Sales chart - returns series data for bar charts */
export const getSalesChartSchema = createSeriesWidgetEndpoint(
  "/dashboard/sales-chart",
);
