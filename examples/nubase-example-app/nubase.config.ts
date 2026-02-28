import { defineConfig } from "@nubase/sdk/config";

export default defineConfig({
  output: { typesDir: ".nubase/types" },
  app: { entry: "src/index.ts" },
});
