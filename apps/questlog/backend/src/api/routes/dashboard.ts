import { createHandler } from "../handler-factory";

/**
 * Dashboard widget endpoints.
 * These return hardcoded data for now - real implementations would query the database.
 */
export const dashboardHandlers = {
  /** Revenue chart - returns series data for area/line/bar charts. */
  getRevenueChart: createHandler((e) => e.getRevenueChart, {
    auth: "required",
    handler: async () => ({
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
    }),
  }),

  /** Browser stats - returns proportional data for pie/donut charts. */
  getBrowserStats: createHandler((e) => e.getBrowserStats, {
    auth: "required",
    handler: async () => ({
      type: "proportional",
      data: [
        { label: "Chrome", value: 275 },
        { label: "Safari", value: 200 },
        { label: "Firefox", value: 187 },
        { label: "Edge", value: 173 },
        { label: "Other", value: 90 },
      ],
    }),
  }),

  /** Total revenue KPI - returns single value with trend. */
  getTotalRevenue: createHandler((e) => e.getTotalRevenue, {
    auth: "required",
    handler: async () => ({
      type: "kpi",
      value: "$45,231.89",
      label: "Total Revenue",
      trend: "+20.1% from last month",
      trendDirection: "up",
    }),
  }),

  /** Active users KPI - returns single value with trend. */
  getActiveUsers: createHandler((e) => e.getActiveUsers, {
    auth: "required",
    handler: async () => ({
      type: "kpi",
      value: "+2,350",
      label: "Active Users",
      trend: "+180.1% from last month",
      trendDirection: "up",
    }),
  }),

  /** Sales chart - returns series data for bar charts. */
  getSalesChart: createHandler((e) => e.getSalesChart, {
    auth: "required",
    handler: async () => ({
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
    }),
  }),

  /** Recent activity - returns table data. */
  getRecentActivity: createHandler((e) => e.getRecentActivity, {
    auth: "required",
    handler: async () => ({
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
    }),
  }),
};
