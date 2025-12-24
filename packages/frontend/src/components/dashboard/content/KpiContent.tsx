import type { KpiData } from "@nubase/core";
import { cn } from "../../../styling/cn";

export interface KpiContentProps {
  data: KpiData;
}

/**
 * Renders KPI content (single value with optional trend) from KpiData.
 * This is a presentation component - data fetching is handled by ConnectedWidget.
 */
export function KpiContent({ data }: KpiContentProps) {
  const trendColor =
    data.trendDirection === "up"
      ? "text-green-600"
      : data.trendDirection === "down"
        ? "text-red-600"
        : "text-muted-foreground";

  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-3xl font-bold">{data.value}</p>
      {data.trend && <p className={cn("text-xs", trendColor)}>{data.trend}</p>}
      {data.label && !data.trend && (
        <p className="text-xs text-muted-foreground">{data.label}</p>
      )}
    </div>
  );
}
