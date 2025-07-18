import { createRoute } from "@tanstack/react-router";
import ResourceScreen from "../screens/Resource";
import { rootRoute } from "./root";

export const resourceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/r/$resource",
  validateSearch: (search: Record<string, unknown>) => ({
    id: search.id as string | undefined,
  }),
  component: ResourceScreen,
});
