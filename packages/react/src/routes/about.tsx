import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "src/routes/root";
import AboutScreen from "src/screens/About";

export const aboutRoute = createRoute({
  component: AboutScreen,
  path: "/about",
  getParentRoute: () => rootRoute,
});
