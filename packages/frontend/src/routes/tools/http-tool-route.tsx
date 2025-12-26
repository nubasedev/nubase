import { createRoute } from "@tanstack/react-router";
import { appShellRoute } from "../root";
import HttpToolScreen from "./http-tool-screen";

export const httpToolRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/t/http",
  component: HttpToolScreen,
});
