import { defineConfig } from "@nubase/cli";

export default defineConfig({
  environments: {
    local: {
      url: "postgres://questlog:questlog@localhost:5434/questlog",
    },
    test: {
      url: "postgresql://questlog:questlog@localhost:5435/questlog",
    },
  },
  defaultEnvironment: "local",
  schemas: ["public"],
});
