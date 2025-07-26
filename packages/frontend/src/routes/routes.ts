import { indexRoute } from "./index/index-route";
import { resourceRoute } from "./resources/resource-route";
import { rootRoute } from "./root";

export const routeTree = rootRoute.addChildren([indexRoute, resourceRoute]);
