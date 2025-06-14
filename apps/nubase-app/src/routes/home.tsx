import { AnyRoute, createRoute } from "@tanstack/react-router";
import { AboutScreen } from "../screens/About";
import { rootRoute } from "./root";
import HomeScreen from "../screens/Home";

export const homeRoute = createRoute({
    component: HomeScreen,
    path: "/",
    getParentRoute: () => rootRoute
})