import { indexRoute } from "./index/index-route";
import { resourceRoute } from "./resources/resource-route";
import { appShellRoute, rootRoute, tenantRoute } from "./root";
import { createSigninRoute } from "./signin/signin-route";

// Create signin route with tenant as parent (avoids circular dependency)
const signinRoute = createSigninRoute(tenantRoute);

export const routeTree = rootRoute.addChildren([
  tenantRoute.addChildren([
    appShellRoute.addChildren([indexRoute, resourceRoute]),
    signinRoute,
  ]),
]);
