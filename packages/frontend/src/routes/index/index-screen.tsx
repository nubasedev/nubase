import {
  Activity,
  ChartArea,
  ChartBar,
  ChartPie,
  DollarSign,
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
} from "../../components/charts/Chart";
import { Dashboard, type Layout } from "../../components/dashboard/Dashboard";
import { DashboardWidget } from "../../components/dashboard/DashboardWidget";

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

export default function IndexScreen() {
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
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
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
}
