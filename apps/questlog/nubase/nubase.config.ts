import { defineConfig } from "@nubase/cli";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

export default defineConfig({
  environments: {
    local: {
      url: requireEnv("DATABASE_URL"),
    },
    prod: {
      url: requireEnv("QUESTLOG_PROD_DATABASE_URL"),
    },
  },
  defaultEnvironment: "local",
  schemas: ["public"],
});
