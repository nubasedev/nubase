import { defineConfig } from "@nubase/sdk/config";

export default defineConfig({
  server: {
    url: process.env.NUBASE_SERVER_URL ?? "http://localhost:3001",
    token: process.env.NUBASE_API_TOKEN,
  },
  workspace: "tavern",
  output: { typesDir: ".nubase/types" },
  app: { entry: "src/index.ts" },
});
