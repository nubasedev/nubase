import { NubaseApp } from "@nubase/react";
import { createRoot } from "react-dom/client";
import { config } from "./config/config";
import "./styles/theme-example.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(<NubaseApp config={config} />);
