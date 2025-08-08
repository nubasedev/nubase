import { indexRoute } from "./index/index-route";
import { resourceRoute } from "./resources/resource-route";
import { rootRoute } from "./root";
import { viewRoute } from "./view/view-route";

export const routeTree = rootRoute.addChildren([
  indexRoute,
  viewRoute,
  resourceRoute,
]);
