import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import HomeScreen from "../screens/Home";
export const homeRoute = createRoute({
    component: HomeScreen,
    path: "/",
    getParentRoute: () => rootRoute
});
