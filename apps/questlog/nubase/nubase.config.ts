import { defineConfig } from "@nubase/cli";

export default defineConfig({
  environments: {
    local: {
      url: process.env.DATABASE_URL!,
    },
    prod: {
      url: process.env.DATABASE_URL!,
    },
  },
  defaultEnvironment: "local",
  schemas: ["public"],
});
