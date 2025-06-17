import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routes/routes";
const root = document.getElementById("root");
if (!root) {
    throw new Error("Root element not found");
}
const router = createRouter({ routeTree });
createRoot(root).render(_jsx(StrictMode, { children: _jsx(RouterProvider, { router: router }) }));
