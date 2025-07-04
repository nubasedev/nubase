import { aboutRoute } from "src/routes/about";
import { homeRoute } from "src/routes/home";
import { resourceRoute } from "src/routes/resource";
import { rootRoute } from "src/routes/root";

export const routeTree = rootRoute.addChildren([
  homeRoute,
  aboutRoute,
  resourceRoute,
]);
