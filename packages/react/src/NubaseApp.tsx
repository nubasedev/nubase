import { createRouter, RouterProvider } from "@tanstack/react-router";
import type { FC } from "react";
import { routeTree } from "src/routes/routes";
import "src/theme/theme.css";

export type NubaseAppProps = Record<string, never>;

const router = createRouter({
  routeTree: routeTree,
});

export const NubaseApp: FC<NubaseAppProps> = () => {
  return <RouterProvider router={router} />;
};
