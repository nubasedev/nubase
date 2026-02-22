import { defineConfig } from "@nubase/cli";

export default defineConfig({
  environments: {
    local: {
      url: "postgres://nubase:nubase@localhost:5434/nubase",
    },
    production: {
      url: process.env.PRODUCTION_DATABASE_URL!,
    },
  },
  defaultEnvironment: "local",
  schemas: ["public"],
});
