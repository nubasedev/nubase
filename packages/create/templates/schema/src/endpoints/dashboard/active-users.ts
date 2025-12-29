import { createKpiWidgetEndpoint } from "@nubase/core";

/** Active users KPI - returns single value with trend */
export const getActiveUsersSchema = createKpiWidgetEndpoint(
	"/dashboard/active-users",
);
