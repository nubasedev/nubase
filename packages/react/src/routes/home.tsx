import { createRoute } from "@tanstack/react-router";
import HomeScreen from "../screens/Home";
import { rootRoute } from "./root";

export const homeRoute = createRoute({
  component: HomeScreen,
  path: "/",
  getParentRoute: () => rootRoute,
});
