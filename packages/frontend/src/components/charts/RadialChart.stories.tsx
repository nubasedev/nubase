import type { Meta, StoryObj } from "@storybook/react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./Chart";

const meta: Meta = {
  title: "Charts/RadialChart",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const chartData = [
  { browser: "Chrome", visitors: 275, fill: "var(--chart1)" },
  { browser: "Safari", visitors: 200, fill: "var(--chart2)" },
  { browser: "Firefox", visitors: 187, fill: "var(--chart3)" },
  { browser: "Edge", visitors: 173, fill: "var(--chart4)" },
  { browser: "Other", visitors: 90, fill: "var(--chart5)" },
];

const chartConfig = {
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

export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[300px]"
      >
        <RadialBarChart data={chartData} innerRadius={30} outerRadius={110}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel nameKey="browser" />}
          />
          <RadialBar dataKey="visitors" background />
        </RadialBarChart>
      </ChartContainer>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => {
    const singleData = [
      { browser: "Safari", visitors: 1260, fill: "var(--chart2)" },
    ];

    return (
      <div className="w-[400px]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadialBarChart
            data={singleData}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="visitors" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {singleData[0]?.visitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </div>
    );
  },
};

export const Grid: Story = {
  render: () => (
    <div className="w-[400px]">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[300px]"
      >
        <RadialBarChart data={chartData} innerRadius={30} outerRadius={100}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel nameKey="browser" />}
          />
          <PolarGrid gridType="circle" />
          <RadialBar dataKey="visitors" />
        </RadialBarChart>
      </ChartContainer>
    </div>
  ),
};

export const Shape: Story = {
  render: () => {
    const progressData = [
      { name: "Progress", value: 75, fill: "var(--chart1)" },
    ];

    const progressConfig = {
      value: {
        label: "Progress",
        color: "var(--chart1)",
      },
    } satisfies ChartConfig;

    return (
      <div className="w-[400px]">
        <ChartContainer
          config={progressConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadialBarChart
            data={progressData}
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={130}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[90, 70]}
            />
            <RadialBar
              dataKey="value"
              background
              cornerRadius={10}
              fill="var(--chart1)"
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-4xl font-bold"
                        >
                          75%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 8}
                          className="fill-muted-foreground text-sm"
                        >
                          Complete
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </div>
    );
  },
};

export const Stacked: Story = {
  render: () => {
    const stackedData = [
      { name: "18-24", desktop: 110, mobile: 80, fill: "var(--chart1)" },
      { name: "25-34", desktop: 180, mobile: 120, fill: "var(--chart2)" },
      { name: "35-44", desktop: 150, mobile: 100, fill: "var(--chart3)" },
      { name: "45-54", desktop: 80, mobile: 50, fill: "var(--chart4)" },
    ];

    const stackedConfig = {
      desktop: {
        label: "Desktop",
        color: "var(--chart1)",
      },
      mobile: {
        label: "Mobile",
        color: "var(--chart2)",
      },
    } satisfies ChartConfig;

    return (
      <div className="w-[400px]">
        <ChartContainer
          config={stackedConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadialBarChart data={stackedData} innerRadius={30} outerRadius={100}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <RadialBar
              dataKey="desktop"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-desktop)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="mobile"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-mobile)"
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </div>
    );
  },
};

export const Text: Story = {
  render: () => {
    const textData = [
      { browser: "Safari", visitors: 200, fill: "var(--chart2)" },
    ];

    return (
      <div className="w-[400px]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadialBarChart
            data={textData}
            endAngle={100}
            innerRadius={80}
            outerRadius={140}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="visitors" background />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {textData[0]?.visitors}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </div>
    );
  },
};
