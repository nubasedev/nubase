import { NubaseApp } from "@nubase/frontend";
import { createRoot } from "react-dom/client";
import { config } from "./frontend-config";
import "./styles/theme.css";

createRoot(document.getElementById("root")!).render(<NubaseApp config={config} />);
