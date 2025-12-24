import type { Meta, StoryObj } from "@storybook/react";
import {
  Activity,
  ChartArea,
  ChartBar,
  ChartLine,
  ChartPie,
  DollarSign,
  Percent,
  Table,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
import { Widget } from "./Widget";

const meta: Meta<typeof Widget> = {
  title: "Components/Widget",
  component: Widget,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Widget title="Widget Title" className="w-[400px]">
      <p className="text-sm text-muted-foreground">
        Widget content goes here. This can be anything - charts, tables, stats,
        forms, etc.
      </p>
    </Widget>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Widget title="Area Chart" icon={ChartArea} className="w-[400px]">
      <p className="text-sm text-muted-foreground">
        Widget with an icon in the header.
      </p>
    </Widget>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Widget
      title="Recent Activity"
      icon={Activity}
      footer={
        <button type="button" className="text-sm text-primary hover:underline">
          View all activity
        </button>
      }
      className="w-[400px]"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div>
            <p className="text-sm font-medium">New user signed up</p>
            <p className="text-xs text-muted-foreground">2 minutes ago</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div>
            <p className="text-sm font-medium">Order #1234 completed</p>
            <p className="text-xs text-muted-foreground">15 minutes ago</p>
          </div>
        </div>
      </div>
    </Widget>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Widget
      title="Sales Report"
      icon={ChartBar}
      action={
        <select className="h-6 rounded-md border bg-background px-2 text-xs">
          <option>Last 3 months</option>
          <option>Last 30 days</option>
          <option>Last 7 days</option>
        </select>
      }
      className="w-[500px]"
    >
      <p className="text-sm text-muted-foreground">
        Content with interactive header action
      </p>
    </Widget>
  ),
};

export const StatsWidget: Story = {
  render: () => (
    <div className="flex gap-4">
      <Widget title="Total Revenue" icon={DollarSign} className="w-[200px]">
        <div className="space-y-1">
          <p className="text-3xl font-bold">$45,231</p>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
        </div>
      </Widget>
      <Widget title="Active Users" icon={Users} className="w-[200px]">
        <div className="space-y-1">
          <p className="text-3xl font-bold">2,350</p>
          <p className="text-xs text-muted-foreground">+180 this week</p>
        </div>
      </Widget>
      <Widget title="Conversion Rate" icon={Percent} className="w-[200px]">
        <div className="space-y-1">
          <p className="text-3xl font-bold">3.2%</p>
          <p className="text-xs text-muted-foreground">+0.5% from last month</p>
        </div>
      </Widget>
    </div>
  ),
};

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

export const WithAreaChart: Story = {
  render: () => (
    <Widget title="Area Chart" icon={ChartArea} className="w-[500px]">
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
            dataKey="mobile"
            type="natural"
            fill="var(--color-mobile)"
            fillOpacity={0.4}
            stroke="var(--color-mobile)"
            stackId="a"
          />
          <Area
            dataKey="desktop"
            type="natural"
            fill="var(--color-desktop)"
            fillOpacity={0.4}
            stroke="var(--color-desktop)"
            stackId="a"
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </Widget>
  ),
};

export const WithBarChart: Story = {
  render: () => (
    <Widget
      title="Bar Chart"
      icon={ChartBar}
      footer={
        <p className="text-sm text-muted-foreground">
          Trending up by 5.2% this month
        </p>
      }
      className="w-[500px]"
    >
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        </BarChart>
      </ChartContainer>
    </Widget>
  ),
};

export const WithLineChart: Story = {
  render: () => (
    <Widget
      title="Line Chart"
      icon={ChartLine}
      action={
        <button
          type="button"
          className="h-6 rounded-md bg-primary px-2 text-xs text-primary-foreground"
        >
          Export
        </button>
      }
      className="w-[500px]"
    >
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <LineChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="desktop"
            type="monotone"
            stroke="var(--color-desktop)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="mobile"
            type="monotone"
            stroke="var(--color-mobile)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </Widget>
  ),
};

const pieChartData = [
  { browser: "Chrome", visitors: 275, fill: "var(--chart1)" },
  { browser: "Safari", visitors: 200, fill: "var(--chart2)" },
  { browser: "Firefox", visitors: 187, fill: "var(--chart3)" },
  { browser: "Edge", visitors: 173, fill: "var(--chart4)" },
  { browser: "Other", visitors: 90, fill: "var(--chart5)" },
];

const pieChartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart4)",
  },
  other: {
    label: "Other",
    color: "var(--chart5)",
  },
} satisfies ChartConfig;

export const WithPieChart: Story = {
  render: () => (
    <Widget title="Browser Usage" icon={ChartPie} className="w-[400px]">
      <ChartContainer
        config={pieChartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie data={pieChartData} dataKey="visitors" nameKey="browser" />
        </PieChart>
      </ChartContainer>
    </Widget>
  ),
};

export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Widget title="Revenue" icon={ChartArea} className="col-span-2">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
          </AreaChart>
        </ChartContainer>
      </Widget>

      <Widget title="Sales" icon={ChartBar}>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
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
      </Widget>

      <Widget title="Traffic" icon={ChartPie}>
        <ChartContainer
          config={pieChartConfig}
          className="mx-auto aspect-square max-h-[150px]"
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
              innerRadius={30}
            />
          </PieChart>
        </ChartContainer>
      </Widget>
    </div>
  ),
};

export const TableWidget: Story = {
  render: () => (
    <Widget
      title="Recent Orders"
      icon={Table}
      footer={
        <button type="button" className="text-sm text-primary hover:underline">
          View all orders
        </button>
      }
      className="w-[500px]"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 font-medium">Order</th>
            <th className="pb-2 font-medium">Customer</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-2">#3210</td>
            <td className="py-2">John Doe</td>
            <td className="py-2">
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                Paid
              </span>
            </td>
            <td className="py-2 text-right">$125.00</td>
          </tr>
          <tr className="border-b">
            <td className="py-2">#3209</td>
            <td className="py-2">Jane Smith</td>
            <td className="py-2">
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                Pending
              </span>
            </td>
            <td className="py-2 text-right">$89.00</td>
          </tr>
          <tr>
            <td className="py-2">#3208</td>
            <td className="py-2">Bob Wilson</td>
            <td className="py-2">
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                Paid
              </span>
            </td>
            <td className="py-2 text-right">$245.00</td>
          </tr>
        </tbody>
      </table>
    </Widget>
  ),
};
