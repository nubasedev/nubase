import { createRoute } from "@tanstack/react-router";
import { AboutScreen } from "../screens/About";
import { rootRoute } from "./root";
export const aboutRoute = createRoute({
    component: AboutScreen,
    path: "/about",
    getParentRoute: () => rootRoute
});
