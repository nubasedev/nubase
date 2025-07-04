import { createRouter } from "@tanstack/react-router";
import { routeTree } from "src/routes/routes";

export const router = createRouter({
  routeTree: routeTree,
});
