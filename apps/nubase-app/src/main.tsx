import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Card } from "@repo/ui/card";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <Card />
  </StrictMode>,
);
