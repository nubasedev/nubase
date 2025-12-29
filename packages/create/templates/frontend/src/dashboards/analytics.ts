import { createDashboard } from "@nubase/frontend";
import { apiEndpoints } from "schema";

/**
 * Analytics dashboard configuration.
 *
 * This dashboard demonstrates the type-safe widget system:
 * - Each widget uses an onLoad callback for data fetching
 * - context.http provides type-safe API access
 * - Layout is defined using react-grid-layout coordinates (x, y, w, h)
 */
export const analyticsDashboard = createDashboard("analytics")
	.withApiEndpoints(apiEndpoints)
	.withTitle("Analytics Dashboard")
	.withWidgets([
		// Revenue trend - area chart spanning most of the top row
		{
			type: "series",
			id: "revenue-chart",
			title: "Revenue Trend",
			variant: "area",
			onLoad: async ({ context }) => {
				return context.http.getRevenueChart({ params: {} });
			},
			defaultLayout: { x: 0, y: 0, w: 8, h: 3 },
		},
		// Browser stats - donut chart on the right
		{
			type: "proportional",
			id: "browser-stats",
			title: "Browser Usage",
			variant: "donut",
			onLoad: async ({ context }) => {
				return context.http.getBrowserStats({ params: {} });
			},
			defaultLayout: { x: 8, y: 0, w: 4, h: 3 },
		},
		// KPI cards - second row
		{
			type: "kpi",
			id: "total-revenue",
			title: "Total Revenue",
			onLoad: async ({ context }) => {
				return context.http.getTotalRevenue({ params: {} });
			},
			defaultLayout: { x: 0, y: 3, w: 3, h: 2 },
		},
		{
			type: "kpi",
			id: "active-users",
			title: "Active Users",
			onLoad: async ({ context }) => {
				return context.http.getActiveUsers({ params: {} });
			},
			defaultLayout: { x: 3, y: 3, w: 3, h: 2 },
		},
		// Sales chart - bar chart
		{
			type: "series",
			id: "sales-chart",
			title: "Weekly Sales",
			variant: "bar",
			onLoad: async ({ context }) => {
				return context.http.getSalesChart({ params: {} });
			},
			defaultLayout: { x: 6, y: 3, w: 6, h: 2 },
		},
		// Recent activity table - bottom row
		{
			type: "table",
			id: "recent-activity",
			title: "Recent Activity",
			onLoad: async ({ context }) => {
				return context.http.getRecentActivity({ params: {} });
			},
			maxRows: 5,
			defaultLayout: { x: 0, y: 5, w: 12, h: 3 },
		},
	]);
