import { createRoute } from "@tanstack/react-router";
import { devRoute } from "../dev-route";
import ColorsScreen from "./colors-screen";

export const colorsRoute = createRoute({
  getParentRoute: () => devRoute,
  path: "/colors",
  component: ColorsScreen,
});
