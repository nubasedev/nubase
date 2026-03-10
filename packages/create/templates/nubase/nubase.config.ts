import { defineConfig } from "@nubase/cli";

export default defineConfig({
  environments: {
    local: {
      url: "postgres://__DB_USER__:__DB_PASSWORD__@localhost:__DEV_PORT__/__DB_NAME__",
    },
    production: {
      url: process.env.PRODUCTION_DATABASE_URL!,
    },
  },
  defaultEnvironment: "local",
  schemas: ["public"],
});
