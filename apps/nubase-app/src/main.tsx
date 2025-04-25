import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Card } from "@repo/ui/card";
import "./globals.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <Card />
  </StrictMode>,
);
