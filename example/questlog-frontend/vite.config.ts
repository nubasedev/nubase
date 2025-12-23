import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
  },
  plugins: [react()],
  server: {
    host: true, // Listen on all interfaces for subdomain support
    open: "http://tavern.localhost:5173/", // Auto-open with subdomain
  },
});
