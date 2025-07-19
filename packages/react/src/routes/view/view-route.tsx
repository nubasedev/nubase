import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../root";
import ViewScreen from "./view-screen";

export const viewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/v/$view",
  validateSearch: (search: Record<string, unknown>) => ({
    id: search.id as string | undefined,
  }),
  component: ViewScreen,
});
