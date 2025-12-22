import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../root";
import SignInScreen from "./signin-screen";

export const signinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signin",
  component: SignInScreen,
});
