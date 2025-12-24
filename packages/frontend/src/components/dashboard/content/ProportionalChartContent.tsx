import type { ProportionalData } from "@nubase/core";
import * as React from "react";
import { Pie, PieChart } from "recharts";
import type { ProportionalChartVariant } from "../../../config/dashboard-widget";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../charts/Chart";

export interface ProportionalChartContentProps {
  data: ProportionalData;
  variant: ProportionalChartVariant;
}

/**
 * Renders proportional chart content (pie or donut) from ProportionalData.
 * This is a presentation component - data fetching is handled by ConnectedWidget.
 */
export function ProportionalChartContent({
  data,
  variant,
}: ProportionalChartContentProps) {
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: { label: "Value" },
    };
    data.data.forEach((item, index) => {
      const key = item.label.toLowerCase().replace(/\s+/g, "-");
      config[key] = {
        label: item.label,
        color: item.fill || `var(--chart${index + 1})`,
      };
    });
    return config;
  }, [data]);

  const chartData = React.useMemo(() => {
    return data.data.map((item, index) => ({
      label: item.label,
      value: item.value,
      fill: item.fill || `var(--chart${(index % 5) + 1})`,
    }));
  }, [data]);

  const innerRadius = variant === "donut" ? 40 : 0;

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="label"
          innerRadius={innerRadius}
        />
      </PieChart>
    </ChartContainer>
  );
}
