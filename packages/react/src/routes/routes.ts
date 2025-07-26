import { colorsRoute } from "./dev/colors/colors-route";
import { devRoute } from "./dev/dev-route";
import { devIndexRoute } from "./dev/index/index-route";
import { rootRoute } from "./root";
import { viewRoute } from "./view/view-route";

export const routeTree = rootRoute.addChildren([
  viewRoute,
  devRoute.addChildren([devIndexRoute, colorsRoute]),
]);
