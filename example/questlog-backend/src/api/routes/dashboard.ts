import { createHttpHandler } from "@nubase/backend";
import { apiEndpoints } from "questlog-schema";
import type { QuestlogUser } from "../../auth";

/**
 * Dashboard widget endpoints.
 * These return hardcoded data for now - real implementations would query the database.
 */

/**
 * Revenue chart - returns series data for area/line/bar charts.
 */
export const handleGetRevenueChart = createHttpHandler<
  typeof apiEndpoints.getRevenueChart,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.getRevenueChart,
  auth: "required",
  handler: async () => {
    return {
      type: "series",
      config: {
        keys: ["desktop", "mobile"],
      },
      data: [
        { category: "January", desktop: 186, mobile: 80 },
        { category: "February", desktop: 305, mobile: 200 },
        { category: "March", desktop: 237, mobile: 120 },
        { category: "April", desktop: 73, mobile: 190 },
        { category: "May", desktop: 209, mobile: 130 },
        { category: "June", desktop: 214, mobile: 140 },
      ],
    };
  },
});

/**
 * Browser stats - returns proportional data for pie/donut charts.
 */
export const handleGetBrowserStats = createHttpHandler<
  typeof apiEndpoints.getBrowserStats,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.getBrowserStats,
  auth: "required",
  handler: async () => {
    return {
      type: "proportional",
      data: [
        { label: "Chrome", value: 275 },
        { label: "Safari", value: 200 },
        { label: "Firefox", value: 187 },
        { label: "Edge", value: 173 },
        { label: "Other", value: 90 },
      ],
    };
  },
});

/**
 * Total revenue KPI - returns single value with trend.
 */
export const handleGetTotalRevenue = createHttpHandler<
  typeof apiEndpoints.getTotalRevenue,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.getTotalRevenue,
  auth: "required",
  handler: async () => {
    return {
      type: "kpi",
      value: "$45,231.89",
      label: "Total Revenue",
      trend: "+20.1% from last month",
      trendDirection: "up",
    };
  },
});

/**
 * Active users KPI - returns single value with trend.
 */
export const handleGetActiveUsers = createHttpHandler<
  typeof apiEndpoints.getActiveUsers,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.getActiveUsers,
  auth: "required",
  handler: async () => {
    return {
      type: "kpi",
      value: "+2,350",
      label: "Active Users",
      trend: "+180.1% from last month",
      trendDirection: "up",
    };
  },
});

/**
 * Sales chart - returns series data for bar charts.
 */
export const handleGetSalesChart = createHttpHandler<
  typeof apiEndpoints.getSalesChart,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.getSalesChart,
  auth: "required",
  handler: async () => {
    return {
      type: "series",
      config: {
        keys: ["sales"],
      },
      data: [
        { category: "Mon", sales: 12 },
        { category: "Tue", sales: 19 },
        { category: "Wed", sales: 3 },
        { category: "Thu", sales: 5 },
        { category: "Fri", sales: 2 },
        { category: "Sat", sales: 8 },
        { category: "Sun", sales: 15 },
      ],
    };
  },
});

/**
 * Recent activity - returns table data.
 */
export const handleGetRecentActivity = createHttpHandler<
  typeof apiEndpoints.getRecentActivity,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.getRecentActivity,
  auth: "required",
  handler: async () => {
    return {
      type: "table",
      columns: [
        { key: "user", label: "User", width: "30%" },
        { key: "action", label: "Action", width: "40%" },
        { key: "time", label: "Time", width: "30%" },
      ],
      rows: [
        { user: "John Doe", action: "Created a new ticket", time: "2 min ago" },
        {
          user: "Jane Smith",
          action: "Updated project settings",
          time: "5 min ago",
        },
        {
          user: "Bob Johnson",
          action: "Closed ticket #123",
          time: "10 min ago",
        },
        {
          user: "Alice Brown",
          action: "Added comment on ticket #456",
          time: "15 min ago",
        },
        {
          user: "Charlie Wilson",
          action: "Assigned ticket to team",
          time: "20 min ago",
        },
      ],
    };
  },
});
