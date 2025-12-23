import type { AnyRoute } from "@tanstack/react-router";
import { createRoute } from "@tanstack/react-router";
import SignUpScreen from "./signup-screen";

// Factory function to create the route with parent injected to avoid circular deps
export const createSignupRoute = (parentRoute: AnyRoute) =>
  createRoute({
    getParentRoute: () => parentRoute,
    path: "/signup",
    component: SignUpScreen,
  });
