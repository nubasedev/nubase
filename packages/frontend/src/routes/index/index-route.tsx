import { createRoute } from "@tanstack/react-router";
import { appShellRoute } from "../root";
import IndexScreen from "./index-screen";

export const indexRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/",
  component: IndexScreen,
});
