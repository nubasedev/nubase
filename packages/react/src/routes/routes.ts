import { rootRoute } from "./root";
import { viewRoute } from "./view/view-route";

export const routeTree = rootRoute.addChildren([viewRoute]);
