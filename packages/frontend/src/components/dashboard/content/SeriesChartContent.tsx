import type { SeriesData } from "@nubase/core";
import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from "recharts";
import type { SeriesChartVariant } from "../../../config/dashboard-widget";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../charts/Chart";

export interface SeriesChartContentProps {
  data: SeriesData;
  variant: SeriesChartVariant;
}

/**
 * Renders series chart content (line, bar, or area) from SeriesData.
 * This is a presentation component - data fetching is handled by ConnectedWidget.
 */
export function SeriesChartContent({ data, variant }: SeriesChartContentProps) {
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    data.config.keys.forEach((key, index) => {
      const labels = data.config.labels as Record<string, string> | undefined;
      const colors = data.config.colors as Record<string, string> | undefined;
      config[key] = {
        label: labels?.[key] || key,
        color: colors?.[key] || `var(--chart${index + 1})`,
      };
    });
    return config;
  }, [data.config]);

  const chartData = React.useMemo(() => {
    return data.data.map((point) => ({
      category: point.category,
      ...Object.fromEntries(
        data.config.keys.map((key) => [key, point[key as keyof typeof point]]),
      ),
    }));
  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      {variant === "line" && (
        <LineChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="category"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) =>
              typeof value === "string" ? value.slice(0, 3) : value
            }
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {data.config.keys.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      )}
      {variant === "area" && (
        <AreaChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="category"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) =>
              typeof value === "string" ? value.slice(0, 3) : value
            }
          />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <ChartLegend content={<ChartLegendContent />} />
          {data.config.keys.map((key) => (
            <Area
              key={key}
              type="natural"
              dataKey={key}
              fill={`var(--color-${key})`}
              fillOpacity={0.4}
              stroke={`var(--color-${key})`}
            />
          ))}
        </AreaChart>
      )}
      {variant === "bar" && (
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="category"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) =>
              typeof value === "string" ? value.slice(0, 3) : value
            }
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {data.config.keys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              radius={4}
            />
          ))}
        </BarChart>
      )}
    </ChartContainer>
  );
}
