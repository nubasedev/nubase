import type { AnyRoute } from "@tanstack/react-router";
import { createRoute } from "@tanstack/react-router";
import HomeScreen from "./home-screen";

export const createHomeRoute = (parentRoute: AnyRoute) =>
  createRoute({
    getParentRoute: () => parentRoute,
    path: "/",
    component: HomeScreen,
  });
