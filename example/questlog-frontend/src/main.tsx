import { NubaseApp } from "@nubase/frontend";
import { createRoot } from "react-dom/client";
import { config } from "./config";
import "./styles/theme-example.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(<NubaseApp config={config} />);
