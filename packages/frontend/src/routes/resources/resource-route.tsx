import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../root";
import ResourceScreen from "./resource-screen";

export const resourceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/r/$resourceName/$operation",
  validateSearch: (search: Record<string, unknown>) => ({
    id: search.id as string | undefined,
  }),
  component: ResourceScreen,
});
