import { createProportionalWidgetEndpoint } from "@nubase/core";

/** Browser stats - returns proportional data for pie/donut charts */
export const getBrowserStatsSchema = createProportionalWidgetEndpoint(
	"/dashboard/browser-stats",
);
