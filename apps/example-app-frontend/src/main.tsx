import { createRoot } from "react-dom/client";
import { NubaseApp } from "@nubase/react";
import "./globals.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(<NubaseApp />);
