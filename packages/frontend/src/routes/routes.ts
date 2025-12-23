import { indexRoute } from "./index/index-route";
import { resourceRoute } from "./resources/resource-route";
import { appShellRoute, rootRoute, tenantRoute } from "./root";
import { createSigninRoute } from "./signin/signin-route";
import { createSignupRoute } from "./signup/signup-route";

// Create root-level auth routes (not under tenant)
const signinRoute = createSigninRoute(rootRoute);
const signupRoute = createSignupRoute(rootRoute);

export const routeTree = rootRoute.addChildren([
  // Root-level auth routes
  signinRoute,
  signupRoute,
  // Tenant routes
  tenantRoute.addChildren([
    appShellRoute.addChildren([indexRoute, resourceRoute]),
  ]),
]);
