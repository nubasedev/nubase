import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
import { NubaseApp } from "@nubase/react";
import "@nubase/react/styles.css";
import { config } from "./config/config";
const root = document.getElementById("root");
if (!root) {
    throw new Error("Root element not found");
}
createRoot(root).render(_jsx(NubaseApp, { config: config }));
