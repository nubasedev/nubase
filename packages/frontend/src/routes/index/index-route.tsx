import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../root";
import IndexScreen from "./index-screen";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexScreen,
});
