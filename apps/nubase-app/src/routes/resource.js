import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import ResourceScreen from "../screens/Resource";
export const resourceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/r/$resource",
    validateSearch: (search) => ({
        id: search.id,
    }),
    component: ResourceScreen,
});
