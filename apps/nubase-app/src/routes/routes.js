import { aboutRoute } from "./about";
import { homeRoute } from "./home";
import { resourceRoute } from "./resource";
import { rootRoute } from "./root";
export const routeTree = rootRoute.addChildren([homeRoute, aboutRoute, resourceRoute]);
