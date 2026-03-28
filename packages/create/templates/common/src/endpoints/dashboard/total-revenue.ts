import { createKpiWidgetEndpoint } from "@nubase/core";

/** Total revenue KPI - returns single value with trend */
export const getTotalRevenueSchema = createKpiWidgetEndpoint(
	"/dashboard/total-revenue",
);
