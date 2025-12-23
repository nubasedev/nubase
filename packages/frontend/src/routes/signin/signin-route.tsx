import type { AnyRoute } from "@tanstack/react-router";
import { createRoute } from "@tanstack/react-router";
import SignInScreen from "./signin-screen";

// Factory function to create the route with parent injected to avoid circular deps
export const createSigninRoute = (parentRoute: AnyRoute) =>
  createRoute({
    getParentRoute: () => parentRoute,
    path: "/signin",
    component: SignInScreen,
  });
