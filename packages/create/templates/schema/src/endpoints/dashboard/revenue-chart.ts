import { createSeriesWidgetEndpoint } from "@nubase/core";

/** Revenue chart - returns series data for area/line/bar charts */
export const getRevenueChartSchema = createSeriesWidgetEndpoint(
	"/dashboard/revenue-chart",
);
