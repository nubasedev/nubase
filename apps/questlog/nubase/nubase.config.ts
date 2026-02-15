import { defineConfig } from "@nubase/cli";

export default defineConfig({
  environments: {
    local: {
      url: "postgres://questlog:questlog@localhost:5434/questlog",
    },
    production: {
      url: process.env.PRODUCTION_DATABASE_URL!,
    },
  },
  defaultEnvironment: "local",
  schemas: ["public"],
});
