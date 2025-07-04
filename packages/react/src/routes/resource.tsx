import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "src/routes/root";
import ResourceScreen from "src/screens/Resource";

export const resourceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/r/$resource",
  validateSearch: (search: Record<string, unknown>) => ({
    id: search.id as string | undefined,
  }),
  component: ResourceScreen,
});
