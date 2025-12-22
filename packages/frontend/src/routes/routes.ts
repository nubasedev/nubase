import { indexRoute } from "./index/index-route";
import { resourceRoute } from "./resources/resource-route";
import { appShellRoute, rootRoute } from "./root";
import { signinRoute } from "./signin/signin-route";

export const routeTree = rootRoute.addChildren([
  appShellRoute.addChildren([indexRoute, resourceRoute]),
  signinRoute,
]);
