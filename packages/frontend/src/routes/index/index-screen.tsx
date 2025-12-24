import { DashboardRenderer } from "../../components/dashboard/DashboardRenderer";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";

/**
 * Index screen that renders the first configured dashboard.
 *
 * The dashboard configuration is loaded from the NubaseFrontendConfig's dashboards property.
 * Each dashboard is rendered using DashboardRenderer which:
 * 1. Creates a grid layout from widget configurations
 * 2. Renders ConnectedWidget for each widget (handles data fetching)
 * 3. Displays the appropriate chart/content based on widget type
 */
export default function IndexScreen() {
  const { config } = useNubaseContext();

  // Get the first dashboard from config (for now we just use the first one)
  const dashboards = config.dashboards;
  const dashboardIds = dashboards ? Object.keys(dashboards) : [];
  const firstDashboardId = dashboardIds[0];
  const dashboard = firstDashboardId ? dashboards?.[firstDashboardId] : null;

  if (!dashboard) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No dashboard configured</p>
          <p className="text-sm">
            Add a dashboard to your NubaseFrontendConfig to display it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <DashboardRenderer dashboard={dashboard} />
    </div>
  );
}
