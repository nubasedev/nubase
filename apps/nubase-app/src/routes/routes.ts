import { aboutRoute } from "./about";
import { homeRoute } from "./home";
import { rootRoute } from "./root";

export const routeTree = rootRoute.addChildren([homeRoute, aboutRoute]);