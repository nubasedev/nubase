import type { Meta, StoryObj } from "@storybook/react";
import { Cell, Label, Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./Chart";

const meta: Meta = {
  title: "Charts/PieChart",
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
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie data={chartData} dataKey="visitors" nameKey="browser" />
        </PieChart>
      </ChartContainer>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px]">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[300px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="visitors"
            nameKey="browser"
            label={({ name, percent }) =>
              `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            labelLine={false}
          />
        </PieChart>
      </ChartContainer>
    </div>
  ),
};

export const WithLegend: Story = {
  render: () => (
    <div className="w-[400px]">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[350px]"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="browser" />} />
          <Pie data={chartData} dataKey="visitors" nameKey="browser" />
          <ChartLegend
            content={<ChartLegendContent nameKey="browser" />}
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
        </PieChart>
      </ChartContainer>
    </div>
  ),
};

export const Donut: Story = {
  render: () => {
    const totalVisitors = chartData.reduce(
      (acc, curr) => acc + curr.visitors,
      0,
    );

    return (
      <div className="w-[400px]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
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
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
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
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    );
  },
};

export const DonutWithLegend: Story = {
  render: () => (
    <div className="w-[400px]">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[350px]"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="browser" />} />
          <Pie
            data={chartData}
            dataKey="visitors"
            nameKey="browser"
            innerRadius={50}
            outerRadius={80}
          />
          <ChartLegend
            content={<ChartLegendContent nameKey="browser" />}
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
        </PieChart>
      </ChartContainer>
    </div>
  ),
};

export const SemiCircle: Story = {
  render: () => (
    <div className="w-[400px]">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[300px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="visitors"
            nameKey="browser"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={100}
          />
        </PieChart>
      </ChartContainer>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const COLORS = [
      "var(--chart1)",
      "var(--chart2)",
      "var(--chart3)",
      "var(--chart4)",
      "var(--chart5)",
    ];

    return (
      <div className="w-[400px]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="browser" />} />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="browser" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </div>
    );
  },
};
