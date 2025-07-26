import { createRoute } from "@tanstack/react-router";
import { devRoute } from "../dev-route";
import IndexScreen from "./index-screen";

export const devIndexRoute = createRoute({
  getParentRoute: () => devRoute,
  path: "/",
  component: IndexScreen,
});
