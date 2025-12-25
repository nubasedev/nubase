# Dashboards

Dashboards provide a configuration-driven way to display data visualizations in your Nubase application. Each dashboard contains widgets that automatically fetch data from backend endpoints and render the appropriate charts, KPIs, or tables.

## Overview

The dashboard system consists of:

1. **Widget Data Schemas** (`@nubase/core`) - Define the data structures for each widget type
2. **Widget Endpoints** (Backend) - API endpoints that return widget data
3. **Dashboard Configuration** (Frontend) - Type-safe widget and layout configuration
4. **Dashboard Renderer** (Frontend) - Automatically fetches data and renders widgets

## Widget Types

Nubase supports four widget types:

| Type | Use Case | Chart Variants |
|------|----------|----------------|
| **Series** | Time-series data, trends | `line`, `bar`, `area` |
| **Proportional** | Part-to-whole relationships | `pie`, `donut` |
| **KPI** | Single metric display | - |
| **Table** | Tabular data | - |

## Quick Start

### 1. Define Endpoint Schemas

In your schema package, create endpoint schemas using the widget helpers:

```typescript
// schema/src/schema/dashboard.ts
import {
  createSeriesWidgetEndpoint,
  createProportionalWidgetEndpoint,
  createKpiWidgetEndpoint,
  createTableWidgetEndpoint,
} from "@nubase/core";

export const getRevenueChartSchema = createSeriesWidgetEndpoint(
  "/dashboard/revenue-chart"
);

export const getBrowserStatsSchema = createProportionalWidgetEndpoint(
  "/dashboard/browser-stats"
);

export const getTotalRevenueSchema = createKpiWidgetEndpoint(
  "/dashboard/total-revenue"
);

export const getRecentActivitySchema = createTableWidgetEndpoint(
  "/dashboard/recent-activity"
);
```

### 2. Add to API Endpoints

Register the dashboard endpoints in your `apiEndpoints`:

```typescript
// schema/src/api-endpoints.ts
import {
  getRevenueChartSchema,
  getBrowserStatsSchema,
  getTotalRevenueSchema,
  getRecentActivitySchema,
} from "./schema/dashboard";

export const apiEndpoints = {
  // ... existing endpoints

  // Dashboard widget endpoints
  getRevenueChart: getRevenueChartSchema,
  getBrowserStats: getBrowserStatsSchema,
  getTotalRevenue: getTotalRevenueSchema,
  getRecentActivity: getRecentActivitySchema,
};
```

### 3. Implement Backend Handlers

Create handlers that return data in the expected format. Export them as an object for auto-registration:

```typescript
// backend/src/api/routes/dashboard.ts
import { createHttpHandler } from "@nubase/backend";
import { apiEndpoints } from "your-schema";

export const dashboardHandlers = {
  getRevenueChart: createHttpHandler({
    endpoint: apiEndpoints.getRevenueChart,
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
        // ... more data
      ],
    }),
  }),

  getBrowserStats: createHttpHandler({
    endpoint: apiEndpoints.getBrowserStats,
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

  getTotalRevenue: createHttpHandler({
    endpoint: apiEndpoints.getTotalRevenue,
    auth: "required",
    handler: async () => ({
      type: "kpi",
      value: "$45,231.89",
      label: "Total Revenue",
      trend: "+20.1% from last month",
      trendDirection: "up",
    }),
  }),

  getRecentActivity: createHttpHandler({
    endpoint: apiEndpoints.getRecentActivity,
    auth: "required",
    handler: async () => ({
      type: "table",
      columns: [
        { key: "user", label: "User", width: "30%" },
        { key: "action", label: "Action", width: "40%" },
        { key: "time", label: "Time", width: "30%" },
      ],
      rows: [
        { user: "John Doe", action: "Created a ticket", time: "2 min ago" },
        { user: "Jane Smith", action: "Updated settings", time: "5 min ago" },
        // ... more rows
      ],
    }),
  }),
};
```

Register the routes in your main app using `registerHandlers`:

```typescript
// backend/src/index.ts
import { registerHandlers } from "@nubase/backend";
import { dashboardHandlers } from "./api/routes/dashboard";

// Auto-registers all dashboard routes based on endpoint path and method
registerHandlers(app, dashboardHandlers);
```

### 4. Create Dashboard Configuration

Use the `createDashboard` builder to configure your dashboard:

```typescript
// frontend/src/dashboards/analytics.ts
import { createDashboard } from "@nubase/frontend";
import { apiEndpoints } from "your-schema";

export const analyticsDashboard = createDashboard("analytics")
  .withApiEndpoints(apiEndpoints)
  .withTitle("Analytics Dashboard")
  .withWidgets([
    {
      type: "series",
      id: "revenue-chart",
      title: "Revenue Trend",
      variant: "area",
      endpoint: "getRevenueChart",  // TypeScript validates this!
      defaultLayout: { x: 0, y: 0, w: 8, h: 3 },
    },
    {
      type: "proportional",
      id: "browser-stats",
      title: "Browser Usage",
      variant: "donut",
      endpoint: "getBrowserStats",
      defaultLayout: { x: 8, y: 0, w: 4, h: 3 },
    },
    {
      type: "kpi",
      id: "total-revenue",
      title: "Total Revenue",
      endpoint: "getTotalRevenue",
      defaultLayout: { x: 0, y: 3, w: 3, h: 2 },
    },
    {
      type: "table",
      id: "recent-activity",
      title: "Recent Activity",
      endpoint: "getRecentActivity",
      maxRows: 5,
      defaultLayout: { x: 3, y: 3, w: 9, h: 3 },
    },
  ]);
```

### 5. Register Dashboard in Config

Add the dashboard to your `NubaseFrontendConfig`:

```typescript
// frontend/src/config.tsx
import { analyticsDashboard } from "./dashboards/analytics";

export const config: NubaseFrontendConfig<typeof apiEndpoints> = {
  // ... other config
  dashboards: {
    [analyticsDashboard.id]: analyticsDashboard,
  },
};
```

The first dashboard in the config will automatically render on the home screen (`/`).

## Data Formats

### Series Data

Used for line, bar, and area charts. The `keys` in config define which numeric fields to plot.

```typescript
{
  type: "series",
  config: {
    keys: ["desktop", "mobile"],  // Fields to plot
    labels: {                      // Optional display labels
      desktop: "Desktop Users",
      mobile: "Mobile Users"
    },
    colors: {                      // Optional custom colors
      desktop: "var(--chart1)",
      mobile: "var(--chart2)"
    }
  },
  data: [
    { category: "Jan", desktop: 186, mobile: 80 },
    { category: "Feb", desktop: 305, mobile: 200 },
    // category is the x-axis label
    // numeric fields are the series values
  ]
}
```

### Proportional Data

Used for pie and donut charts. Colors are automatically assigned by the frontend.

```typescript
{
  type: "proportional",
  data: [
    { label: "Chrome", value: 275 },
    { label: "Safari", value: 200 },
    { label: "Firefox", value: 187 },
    // label is the segment name
    // value is the numeric value
  ]
}
```

### KPI Data

Used for single-value displays with optional trend indicators.

```typescript
{
  type: "kpi",
  value: "$45,231.89",           // Main display value (string for formatting)
  label: "Total Revenue",        // Optional label
  trend: "+20.1% from last month", // Optional trend text
  trendDirection: "up"           // "up" | "down" | "neutral"
}
```

### Table Data

Used for tabular data display.

```typescript
{
  type: "table",
  columns: [
    { key: "user", label: "User", width: "30%" },
    { key: "action", label: "Action", width: "40%" },
    { key: "time", label: "Time", width: "30%" }
  ],
  rows: [
    { user: "John Doe", action: "Created ticket", time: "2 min ago" },
    { user: "Jane Smith", action: "Updated settings", time: "5 min ago" }
    // Row keys must match column keys
  ]
}
```

## Widget Configuration

### Common Properties

All widgets share these properties:

| Property | Type | Description |
|----------|------|-------------|
| `type` | `"series" \| "proportional" \| "kpi" \| "table"` | Widget type |
| `id` | `string` | Unique identifier |
| `title` | `string` | Display title |
| `endpoint` | `string` | API endpoint key (type-checked!) |
| `icon` | `IconComponent` | Optional header icon |
| `defaultLayout` | `WidgetLayoutConfig` | Grid position and size |
| `refreshInterval` | `number` | Optional auto-refresh in ms |

### Layout Configuration

The `defaultLayout` uses react-grid-layout coordinates:

```typescript
{
  x: 0,      // Column position (0-based)
  y: 0,      // Row position (0-based)
  w: 4,      // Width in grid columns (out of 12)
  h: 3,      // Height in grid rows
  minW: 2,   // Optional minimum width
  minH: 2,   // Optional minimum height
  maxW: 12,  // Optional maximum width
  maxH: 6,   // Optional maximum height
  static: false  // If true, widget cannot be moved/resized
}
```

### Series Widget

```typescript
{
  type: "series",
  id: "revenue",
  title: "Revenue",
  variant: "area",  // "line" | "bar" | "area"
  endpoint: "getRevenueChart",
  defaultLayout: { x: 0, y: 0, w: 8, h: 3 },
}
```

### Proportional Widget

```typescript
{
  type: "proportional",
  id: "browsers",
  title: "Browser Stats",
  variant: "donut",  // "pie" | "donut"
  endpoint: "getBrowserStats",
  defaultLayout: { x: 8, y: 0, w: 4, h: 3 },
}
```

### KPI Widget

```typescript
{
  type: "kpi",
  id: "total-revenue",
  title: "Total Revenue",
  endpoint: "getTotalRevenue",
  defaultLayout: { x: 0, y: 3, w: 3, h: 2 },
}
```

### Table Widget

```typescript
{
  type: "table",
  id: "activity",
  title: "Recent Activity",
  endpoint: "getRecentActivity",
  maxRows: 5,  // Optional row limit
  defaultLayout: { x: 3, y: 3, w: 9, h: 3 },
}
```

## Type Safety

The dashboard system provides compile-time type safety:

```typescript
// This compiles - getRevenueChart returns SeriesData
{
  type: "series",
  endpoint: "getRevenueChart",  // ✓
}

// This fails at compile time - getTicket doesn't return SeriesData
{
  type: "series",
  endpoint: "getTicket",  // ✗ TypeScript error
}
```

This is achieved through the builder pattern:

1. `createDashboard("id")` - Creates the builder
2. `.withApiEndpoints(apiEndpoints)` - Provides type context
3. `.withWidgets([...])` - TypeScript validates endpoint/type compatibility

## Dashboard Builder API

### `createDashboard(id)`

Creates a new dashboard builder.

```typescript
const dashboard = createDashboard("my-dashboard");
```

### `.withApiEndpoints(endpoints)`

Provides API endpoints for type-safe endpoint references. **Must be called before `.withWidgets()`**.

```typescript
.withApiEndpoints(apiEndpoints)
```

### `.withTitle(title)`

Sets the dashboard display title.

```typescript
.withTitle("My Dashboard")
```

### `.withIcon(icon)`

Sets an optional dashboard icon.

```typescript
import { LayoutDashboard } from "lucide-react";
.withIcon(LayoutDashboard)
```

### `.withGridConfig(config)`

Configures the grid layout.

```typescript
.withGridConfig({
  cols: 12,           // Number of columns (default: 12)
  rowHeight: 100,     // Row height in pixels (default: 100)
  margin: [16, 16],   // Gap between widgets [x, y]
  containerPadding: [0, 0],  // Container padding [x, y]
})
```

### `.withWidgets(widgets)`

Configures widgets and returns the final `DashboardDescriptor`. **Must be called last**.

```typescript
.withWidgets([
  { type: "kpi", id: "users", ... },
  { type: "series", id: "revenue", ... },
])
```

## Rendering Dashboards

### Automatic (Home Screen)

The first dashboard in `config.dashboards` automatically renders on the home screen.

### Manual Rendering

Use `DashboardRenderer` to render a dashboard anywhere:

```tsx
import { DashboardRenderer } from "@nubase/frontend";
import { analyticsDashboard } from "./dashboards/analytics";

function MyPage() {
  return (
    <div className="p-4">
      <DashboardRenderer dashboard={analyticsDashboard} />
    </div>
  );
}
```

### Controlled Layout

You can control the layout state externally:

```tsx
import { useState } from "react";
import { DashboardRenderer, type Layout } from "@nubase/frontend";

function MyPage() {
  const [layout, setLayout] = useState<Layout>();

  return (
    <DashboardRenderer
      dashboard={analyticsDashboard}
      layout={layout}
      onLayoutChange={setLayout}
    />
  );
}
```

## Colors

Chart colors are automatically assigned from the theme's chart color palette:

- `var(--chart1)` through `var(--chart5)`

These are defined in your theme and cycle for series with more than 5 data points.

For series charts, you can optionally provide custom colors in the config:

```typescript
{
  type: "series",
  config: {
    keys: ["revenue", "costs"],
    colors: {
      revenue: "var(--color-success)",
      costs: "var(--color-error)"
    }
  },
  data: [...]
}
```

## Best Practices

1. **Keep endpoints focused** - Each widget should have its own endpoint returning exactly what it needs.

2. **Use meaningful IDs** - Widget IDs should be descriptive (`revenue-trend`, not `widget1`).

3. **Consider layout carefully** - Plan your grid layout to work well on different screen sizes.

4. **Set appropriate refresh intervals** - Only use `refreshInterval` for data that changes frequently.

5. **Handle loading states** - The `ConnectedWidget` component automatically shows loading indicators.

6. **Type your endpoints** - Always use the helper functions (`createSeriesWidgetEndpoint`, etc.) to ensure type safety.

## Example: Complete Dashboard

Here's a complete example showing all widget types:

```typescript
// dashboards/sales.ts
import { createDashboard } from "@nubase/frontend";
import { DollarSign, Users, ShoppingCart, Activity } from "lucide-react";
import { apiEndpoints } from "your-schema";

export const salesDashboard = createDashboard("sales")
  .withApiEndpoints(apiEndpoints)
  .withTitle("Sales Dashboard")
  .withGridConfig({ rowHeight: 100 })
  .withWidgets([
    // KPI row
    {
      type: "kpi",
      id: "total-revenue",
      title: "Total Revenue",
      icon: DollarSign,
      endpoint: "getTotalRevenue",
      defaultLayout: { x: 0, y: 0, w: 3, h: 2 },
    },
    {
      type: "kpi",
      id: "active-users",
      title: "Active Users",
      icon: Users,
      endpoint: "getActiveUsers",
      defaultLayout: { x: 3, y: 0, w: 3, h: 2 },
    },
    {
      type: "kpi",
      id: "orders",
      title: "Orders Today",
      icon: ShoppingCart,
      endpoint: "getOrdersToday",
      defaultLayout: { x: 6, y: 0, w: 3, h: 2 },
    },
    {
      type: "kpi",
      id: "conversion",
      title: "Conversion Rate",
      icon: Activity,
      endpoint: "getConversionRate",
      defaultLayout: { x: 9, y: 0, w: 3, h: 2 },
    },
    // Charts row
    {
      type: "series",
      id: "revenue-chart",
      title: "Revenue Trend",
      variant: "area",
      endpoint: "getRevenueChart",
      defaultLayout: { x: 0, y: 2, w: 8, h: 3 },
      refreshInterval: 60000,  // Refresh every minute
    },
    {
      type: "proportional",
      id: "sales-by-region",
      title: "Sales by Region",
      variant: "donut",
      endpoint: "getSalesByRegion",
      defaultLayout: { x: 8, y: 2, w: 4, h: 3 },
    },
    // Table row
    {
      type: "table",
      id: "recent-orders",
      title: "Recent Orders",
      endpoint: "getRecentOrders",
      maxRows: 10,
      defaultLayout: { x: 0, y: 5, w: 12, h: 4 },
    },
  ]);
```
