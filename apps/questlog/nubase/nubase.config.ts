import { defineConfig } from "@nubase/cli";

export default defineConfig({
  environments: {
    local: {
      url: process.env.DATABASE_URL!,
    },
    prod: {
      url: process.env.QUESTLOG_PROD_DATABASE_URL!,
    },
  },
  defaultEnvironment: "local",
  schemas: ["public"],
});
