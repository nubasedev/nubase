import type { Meta, StoryObj } from "@storybook/react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./Chart";

const meta: Meta = {
  title: "Charts/RadarChart",
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
    <div className="w-[400px]">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[300px]"
      >
        <RadarChart data={chartData}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <PolarGrid className="fill-[--color-desktop] opacity-20" />
          <PolarAngleAxis dataKey="month" />
          <Radar
            dataKey="desktop"
            fill="var(--color-desktop)"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  ),
};

export const WithDots: Story = {
  render: () => (
    <div className="w-[400px]">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[300px]"
      >
        <RadarChart data={chartData}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <PolarAngleAxis dataKey="month" />
          <PolarGrid />
          <Radar
            dataKey="desktop"
            fill="var(--color-desktop)"
            fillOpacity={0.6}
            dot={{
              r: 4,
              fillOpacity: 1,
            }}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="w-[400px]">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[350px]"
      >
        <RadarChart data={chartData}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <PolarAngleAxis dataKey="month" />
          <PolarGrid />
          <Radar
            dataKey="desktop"
            fill="var(--color-desktop)"
            fillOpacity={0.6}
          />
          <Radar
            dataKey="mobile"
            fill="var(--color-mobile)"
            fillOpacity={0.6}
          />
          <ChartLegend className="mt-8" content={<ChartLegendContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
  ),
};

export const LinesOnly: Story = {
  render: () => (
    <div className="w-[400px]">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[350px]"
      >
        <RadarChart data={chartData}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <PolarGrid radialLines={false} />
          <PolarAngleAxis dataKey="month" />
          <Radar
            dataKey="desktop"
            stroke="var(--color-desktop)"
            fill="transparent"
            strokeWidth={2}
          />
          <Radar
            dataKey="mobile"
            stroke="var(--color-mobile)"
            fill="transparent"
            strokeWidth={2}
          />
          <ChartLegend className="mt-8" content={<ChartLegendContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
  ),
};

const skillsData = [
  { skill: "JavaScript", level: 90 },
  { skill: "TypeScript", level: 85 },
  { skill: "React", level: 88 },
  { skill: "Node.js", level: 75 },
  { skill: "CSS", level: 82 },
  { skill: "Testing", level: 70 },
];

const skillsConfig = {
  level: {
    label: "Skill Level",
    color: "var(--chart3)",
  },
} satisfies ChartConfig;

export const SkillsRadar: Story = {
  render: () => (
    <div className="w-[400px]">
      <ChartContainer
        config={skillsConfig}
        className="mx-auto aspect-square max-h-[300px]"
      >
        <RadarChart data={skillsData}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <PolarAngleAxis dataKey="skill" />
          <PolarGrid />
          <Radar
            dataKey="level"
            fill="var(--color-level)"
            fillOpacity={0.6}
            stroke="var(--color-level)"
            strokeWidth={2}
            dot={{
              r: 4,
              fillOpacity: 1,
            }}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  ),
};

export const FilledBackground: Story = {
  render: () => (
    <div className="w-[400px]">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[300px]"
      >
        <RadarChart data={chartData}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <PolarAngleAxis
            dataKey="month"
            tick={(props) => {
              const {
                x,
                y,
                textAnchor,
                payload,
                index = 0,
              } = props as {
                x?: string | number;
                y?: string | number;
                textAnchor?: "inherit" | "end" | "start" | "middle";
                payload?: { value?: string };
                index?: number;
              };
              const data = chartData[index];
              const yPos = typeof y === "number" ? y : 0;
              return (
                <text
                  x={x}
                  y={index === 0 ? yPos - 10 : yPos}
                  textAnchor={textAnchor}
                  fontSize={12}
                  fontWeight={500}
                >
                  <tspan className="fill-muted-foreground">
                    {data?.desktop}
                  </tspan>
                  <tspan className="fill-foreground"> {payload?.value}</tspan>
                </text>
              );
            }}
          />
          <PolarGrid className="fill-muted opacity-50" gridType="circle" />
          <Radar
            dataKey="desktop"
            fill="var(--color-desktop)"
            fillOpacity={0.5}
            stroke="var(--color-desktop)"
            strokeWidth={2}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  ),
};
