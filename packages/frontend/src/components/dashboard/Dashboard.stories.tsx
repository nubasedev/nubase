import type { Meta, StoryObj } from "@storybook/react";
import {
  Activity,
  ChartArea,
  ChartBar,
  ChartPie,
  DollarSign,
  Table,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../charts/Chart";
import { Dashboard, type Layout } from "./Dashboard";
import { DashboardWidget } from "./DashboardWidget";

const meta: Meta<typeof Dashboard> = {
  title: "Dashboards/Dashboard",
  component: Dashboard,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart2)",
  },
} satisfies ChartConfig;

const pieChartData = [
  { browser: "Chrome", visitors: 275, fill: "var(--chart1)" },
  { browser: "Safari", visitors: 200, fill: "var(--chart2)" },
  { browser: "Firefox", visitors: 187, fill: "var(--chart3)" },
  { browser: "Edge", visitors: 173, fill: "var(--chart4)" },
  { browser: "Other", visitors: 90, fill: "var(--chart5)" },
];

const pieChartConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "var(--chart1)" },
  safari: { label: "Safari", color: "var(--chart2)" },
  firefox: { label: "Firefox", color: "var(--chart3)" },
  edge: { label: "Edge", color: "var(--chart4)" },
  other: { label: "Other", color: "var(--chart5)" },
} satisfies ChartConfig;

const defaultLayout: Layout = [
  { i: "revenue", x: 0, y: 0, w: 8, h: 3 },
  { i: "users", x: 8, y: 0, w: 4, h: 3 },
  { i: "stats-1", x: 0, y: 3, w: 3, h: 2 },
  { i: "stats-2", x: 3, y: 3, w: 3, h: 2 },
  { i: "stats-3", x: 6, y: 3, w: 3, h: 2 },
  { i: "activity", x: 9, y: 3, w: 3, h: 2 },
];

export const Default: Story = {
  render: () => {
    const [layout, setLayout] = useState<Layout>(defaultLayout);

    return (
      <div className="p-4">
        <Dashboard
          layout={layout}
          onLayoutChange={setLayout}
          gridConfig={{ rowHeight: 100 }}
        >
          <div key="revenue">
            <DashboardWidget title="Revenue" icon={ChartArea}>
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </DashboardWidget>
          </div>

          <div key="users">
            <DashboardWidget title="Traffic by Browser" icon={ChartPie}>
              <ChartContainer
                config={pieChartConfig}
                className="mx-auto aspect-square h-full"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={pieChartData}
                    dataKey="visitors"
                    nameKey="browser"
                    innerRadius={40}
                  />
                </PieChart>
              </ChartContainer>
            </DashboardWidget>
          </div>

          <div key="stats-1">
            <DashboardWidget title="Total Revenue" icon={DollarSign}>
              <div className="flex h-full flex-col justify-center">
                <p className="text-3xl font-bold">$45,231</p>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </div>
            </DashboardWidget>
          </div>

          <div key="stats-2">
            <DashboardWidget title="Active Users" icon={Users}>
              <div className="flex h-full flex-col justify-center">
                <p className="text-3xl font-bold">2,350</p>
                <p className="text-xs text-muted-foreground">+180 this week</p>
              </div>
            </DashboardWidget>
          </div>

          <div key="stats-3">
            <DashboardWidget title="Sales" icon={ChartBar}>
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart accessibilityLayer data={chartData.slice(0, 4)}>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar
                    dataKey="desktop"
                    fill="var(--color-desktop)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </DashboardWidget>
          </div>

          <div key="activity">
            <DashboardWidget
              title="Recent Activity"
              icon={Activity}
              footer={
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  View all
                </button>
              }
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs">New user signed up</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs">Order completed</span>
                </div>
              </div>
            </DashboardWidget>
          </div>
        </Dashboard>
      </div>
    );
  },
};

export const WithActions: Story = {
  render: () => {
    const [layout, setLayout] = useState<Layout>([
      { i: "chart", x: 0, y: 0, w: 6, h: 3 },
      { i: "table", x: 6, y: 0, w: 6, h: 3 },
    ]);

    return (
      <div className="p-4">
        <Dashboard
          layout={layout}
          onLayoutChange={setLayout}
          gridConfig={{ rowHeight: 100 }}
        >
          <div key="chart">
            <DashboardWidget
              title="Sales Report"
              icon={ChartBar}
              action={
                <select className="h-6 rounded-md border bg-background px-2 text-xs">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                </select>
              }
            >
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="desktop"
                    fill="var(--color-desktop)"
                    radius={4}
                  />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                </BarChart>
              </ChartContainer>
            </DashboardWidget>
          </div>

          <div key="table">
            <DashboardWidget
              title="Recent Orders"
              icon={Table}
              action={
                <button
                  type="button"
                  className="h-6 rounded-md bg-primary px-2 text-xs text-primary-foreground"
                >
                  Export
                </button>
              }
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Order</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">#3210</td>
                    <td className="py-2">John Doe</td>
                    <td className="py-2 text-right">$125.00</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">#3209</td>
                    <td className="py-2">Jane Smith</td>
                    <td className="py-2 text-right">$89.00</td>
                  </tr>
                  <tr>
                    <td className="py-2">#3208</td>
                    <td className="py-2">Bob Wilson</td>
                    <td className="py-2 text-right">$245.00</td>
                  </tr>
                </tbody>
              </table>
            </DashboardWidget>
          </div>
        </Dashboard>
      </div>
    );
  },
};

export const StaticWidget: Story = {
  render: () => {
    const [layout, setLayout] = useState<Layout>([
      { i: "static", x: 0, y: 0, w: 4, h: 2, static: true },
      { i: "movable-1", x: 4, y: 0, w: 4, h: 2 },
      { i: "movable-2", x: 8, y: 0, w: 4, h: 2 },
    ]);

    return (
      <div className="p-4">
        <Dashboard
          layout={layout}
          onLayoutChange={setLayout}
          gridConfig={{ rowHeight: 100 }}
        >
          <div key="static">
            <DashboardWidget
              title="Static Widget (Cannot Move)"
              icon={DollarSign}
              draggable={false}
            >
              <div className="flex h-full flex-col justify-center">
                <p className="text-3xl font-bold">$45,231</p>
                <p className="text-xs text-muted-foreground">
                  This widget is pinned in place
                </p>
              </div>
            </DashboardWidget>
          </div>

          <div key="movable-1">
            <DashboardWidget title="Movable Widget 1" icon={Users}>
              <div className="flex h-full flex-col justify-center">
                <p className="text-3xl font-bold">2,350</p>
                <p className="text-xs text-muted-foreground">Drag me around!</p>
              </div>
            </DashboardWidget>
          </div>

          <div key="movable-2">
            <DashboardWidget title="Movable Widget 2" icon={Activity}>
              <div className="flex h-full flex-col justify-center">
                <p className="text-3xl font-bold">98%</p>
                <p className="text-xs text-muted-foreground">
                  I can be moved too
                </p>
              </div>
            </DashboardWidget>
          </div>
        </Dashboard>
      </div>
    );
  },
};

export const ResizeDisabled: Story = {
  render: () => {
    const [layout, setLayout] = useState<Layout>([
      { i: "widget-1", x: 0, y: 0, w: 4, h: 2 },
      { i: "widget-2", x: 4, y: 0, w: 4, h: 2 },
      { i: "widget-3", x: 8, y: 0, w: 4, h: 2 },
    ]);

    return (
      <div className="p-4">
        <Dashboard
          layout={layout}
          onLayoutChange={setLayout}
          gridConfig={{ rowHeight: 100 }}
          resizeConfig={{ enabled: false }}
        >
          <div key="widget-1">
            <DashboardWidget title="Widget 1" icon={ChartArea}>
              <p className="text-sm text-muted-foreground">
                Resizing is disabled for this dashboard
              </p>
            </DashboardWidget>
          </div>

          <div key="widget-2">
            <DashboardWidget title="Widget 2" icon={ChartBar}>
              <p className="text-sm text-muted-foreground">
                You can still drag widgets around
              </p>
            </DashboardWidget>
          </div>

          <div key="widget-3">
            <DashboardWidget title="Widget 3" icon={ChartPie}>
              <p className="text-sm text-muted-foreground">
                But you cannot resize them
              </p>
            </DashboardWidget>
          </div>
        </Dashboard>
      </div>
    );
  },
};
