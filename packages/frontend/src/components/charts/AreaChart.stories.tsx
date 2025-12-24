import type { Meta, StoryObj } from "@storybook/react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./Chart";

const meta: Meta = {
  title: "Charts/AreaChart",
  parameters: {
    layout: "centered",
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

export const Default: Story = {
  render: () => (
    <div className="w-[600px]">
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
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
        </AreaChart>
      </ChartContainer>
    </div>
  ),
};

export const Stacked: Story = {
  render: () => (
    <div className="w-[600px]">
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
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
    </div>
  ),
};

export const WithAxes: Story = {
  render: () => (
    <div className="w-[600px]">
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <AreaChart accessibilityLayer data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="desktop"
            type="monotone"
            fill="var(--color-desktop)"
            fillOpacity={0.3}
            stroke="var(--color-desktop)"
            strokeWidth={2}
          />
          <Area
            dataKey="mobile"
            type="monotone"
            fill="var(--color-mobile)"
            fillOpacity={0.3}
            stroke="var(--color-mobile)"
            strokeWidth={2}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  ),
};

const stepChartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart1)",
  },
} satisfies ChartConfig;

const stepChartData = [
  { month: "January", visitors: 186 },
  { month: "February", visitors: 305 },
  { month: "March", visitors: 237 },
  { month: "April", visitors: 73 },
  { month: "May", visitors: 209 },
  { month: "June", visitors: 214 },
];

export const StepArea: Story = {
  render: () => (
    <div className="w-[600px]">
      <ChartContainer config={stepChartConfig} className="min-h-[300px] w-full">
        <AreaChart accessibilityLayer data={stepChartData}>
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
            content={<ChartTooltipContent indicator="line" />}
          />
          <Area
            dataKey="visitors"
            type="step"
            fill="var(--color-visitors)"
            fillOpacity={0.4}
            stroke="var(--color-visitors)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  ),
};

export const Gradient: Story = {
  render: () => (
    <div className="w-[600px]">
      <ChartContainer config={stepChartConfig} className="min-h-[300px] w-full">
        <AreaChart accessibilityLayer data={stepChartData}>
          <defs>
            <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-visitors)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-visitors)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
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
            dataKey="visitors"
            type="natural"
            fill="url(#fillVisitors)"
            stroke="var(--color-visitors)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  ),
};
