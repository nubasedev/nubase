import { colorsRoute } from "./dev/colors/colors-route";
import { devRoute } from "./dev/dev-route";
import { devIndexRoute } from "./dev/index/index-route";
import { indexRoute } from "./index/index-route";
import { resourceRoute } from "./resources/resource-route";
import { rootRoute } from "./root";
import { viewRoute } from "./view/view-route";

export const routeTree = rootRoute.addChildren([
  indexRoute,
  viewRoute,
  resourceRoute,
  devRoute.addChildren([devIndexRoute, colorsRoute]),
]);
