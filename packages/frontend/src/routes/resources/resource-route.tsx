import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../root";
import ResourceScreen from "./resource-screen";

export const resourceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/r/$resourceName/$operation",
  validateSearch: (search: Record<string, unknown>) => {
    // Pass through all search params as-is
    // Type coercion will be handled by the component based on the schema
    return search as Record<string, any>;
  },
  component: ResourceScreen,
});
