import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    passWithNoTests: true,
    exclude: ["e2e/**", "node_modules/**"],
  },
});
