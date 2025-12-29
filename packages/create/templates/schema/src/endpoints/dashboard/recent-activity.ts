import { createTableWidgetEndpoint } from "@nubase/core";

/** Recent activity - returns table data */
export const getRecentActivitySchema = createTableWidgetEndpoint(
	"/dashboard/recent-activity",
);
