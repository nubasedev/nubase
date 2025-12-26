import { indexRoute } from "./index/index-route";
import { resourceRoute } from "./resources/resource-route";
import { appShellRoute, rootRoute, workspaceRoute } from "./root";
import { createSigninRoute } from "./signin/signin-route";
import { createSignupRoute } from "./signup/signup-route";
import { httpToolRoute } from "./tools/http-tool-route";

// Create root-level auth routes (not under workspace)
const signinRoute = createSigninRoute(rootRoute);
const signupRoute = createSignupRoute(rootRoute);

export const routeTree = rootRoute.addChildren([
  // Root-level auth routes
  signinRoute,
  signupRoute,
  // Workspace routes
  workspaceRoute.addChildren([
    appShellRoute.addChildren([indexRoute, resourceRoute, httpToolRoute]),
  ]),
]);
