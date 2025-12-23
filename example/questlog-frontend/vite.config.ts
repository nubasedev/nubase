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
    port: 3002, // Development port
    open: "http://tavern.localhost:3002/", // Auto-open with subdomain
  },
});
