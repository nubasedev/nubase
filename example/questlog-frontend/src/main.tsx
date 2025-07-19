import { createRoot } from "react-dom/client";
import "@nubase/react/styles.css";
import { NubaseApp } from "@nubase/react";
import { config } from "./config/config";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(<NubaseApp config={config} />);
