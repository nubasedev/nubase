import build from "@hono/vite-build/node";
import devServer, { defaultOptions } from "@hono/vite-dev-server";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      plugins: [react(), tailwindcss()],
      build: {
        outDir: "dist/client",
        emptyOutDir: true,
      },
    };
  }

  if (mode === "server") {
    return {
      plugins: [
        build({
          entry: "src/backend/app.ts",
        }),
      ],
    };
  }

  // Development mode
  return {
    plugins: [
      react(),
      tailwindcss(),
      devServer({
        entry: "src/backend/app.ts",
        exclude: [
          // Only send /api requests to Hono; everything else goes to Vite
          /^(?!\/api(\/|$)).+/,
          ...defaultOptions.exclude,
        ],
      }),
    ],
    ssr: {
      external: [
        "@nubase/core",
        "@nubase/backend",
        "@nubase/frontend",
        "pg",
        "kysely",
        "bcryptjs",
        "jsonwebtoken",
        "dotenv",
        "@hono/node-server",
        "@faker-js/faker",
      ],
    },
    server: {
      port: 3000,
      strictPort: true,
    },
  };
});
