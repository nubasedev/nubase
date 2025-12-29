import type {
  KpiData,
  ProportionalData,
  SeriesData,
  TableData,
} from "@nubase/core";
import { useQuery } from "@tanstack/react-query";
import type { WidgetDescriptor } from "../../config/dashboard-widget";
import { ActivityIndicator } from "../activity-indicator/ActivityIndicator";
import { useNubaseContext } from "../nubase-app/NubaseContextProvider";
import { KpiContent } from "./content/KpiContent";
import { ProportionalChartContent } from "./content/ProportionalChartContent";
import { SeriesChartContent } from "./content/SeriesChartContent";
import { TableContent } from "./content/TableContent";
import { DashboardWidget } from "./DashboardWidget";

export interface ConnectedWidgetProps {
  widget: WidgetDescriptor<unknown>;
}

/**
 * ConnectedWidget handles data fetching and renders the appropriate content
 * inside a DashboardWidget based on the widget type.
 *
 * This component:
 * 1. Calls the widget's onLoad callback to fetch data
 * 2. Shows loading/error states
 * 3. Renders the appropriate content renderer based on widget type
 * 4. Wraps everything in the DashboardWidget presentation component
 */
export function ConnectedWidget({ widget }: ConnectedWidgetProps) {
  const context = useNubaseContext();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-widget", widget.id],
    queryFn: async () => {
      const response = await widget.onLoad({ context });
      return response.data;
    },
    refetchInterval: widget.refreshInterval,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <ActivityIndicator size="md" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex h-full items-center justify-center text-destructive">
          <span className="text-sm">Failed to load widget data</span>
        </div>
      );
    }
    if (data) {
      return <WidgetContent widget={widget} data={data} />;
    }
    return null;
  };

  return (
    <DashboardWidget title={widget.title} icon={widget.icon}>
      {renderContent()}
    </DashboardWidget>
  );
}

interface WidgetContentProps {
  widget: WidgetDescriptor<any>;
  data: unknown;
}

/**
 * Renders the appropriate content based on widget type.
 */
function WidgetContent({ widget, data }: WidgetContentProps) {
  switch (widget.type) {
    case "series":
      return (
        <SeriesChartContent
          data={data as SeriesData}
          variant={widget.variant}
        />
      );
    case "proportional":
      return (
        <ProportionalChartContent
          data={data as ProportionalData}
          variant={widget.variant}
        />
      );
    case "kpi":
      return <KpiContent data={data as KpiData} />;
    case "table":
      return <TableContent data={data as TableData} maxRows={widget.maxRows} />;
    default:
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <span className="text-sm">Unknown widget type</span>
        </div>
      );
  }
}
