import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routes/routes";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

const router = createRouter({ routeTree })

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
