import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "src/routes/root";
import HomeScreen from "src/screens/Home";

export const homeRoute = createRoute({
  component: HomeScreen,
  path: "/",
  getParentRoute: () => rootRoute,
});
