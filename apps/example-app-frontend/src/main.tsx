import { createRoot } from "react-dom/client";
import "@nubase/react/styles.css";
import { config } from "./config/config";
import { NubaseApp } from "@nubase/react/nubase-app/NubaseApp";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(<NubaseApp config={config} />);
