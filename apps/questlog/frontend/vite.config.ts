import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
  },
  plugins: [react()],
  server: {
    port: 3002, // Development port
    open: "http://localhost:3002/tavern", // Auto-open with workspace path
  },
});
