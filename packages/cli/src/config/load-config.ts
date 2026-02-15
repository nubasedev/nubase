import { mkdirSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createJiti } from "jiti";
import { findProjectRoot } from "./find-project-root.js";
import type { NubaseConfig, ResolvedConfig } from "./types.js";

const jiti = createJiti(import.meta.url);

export async function loadConfig(envFlag?: string): Promise<ResolvedConfig> {
  const projectRoot = findProjectRoot();

  // Load .env from the project root (parent of nubase/ folder)
  const appRoot = path.dirname(projectRoot);
  dotenv.config({ path: path.join(appRoot, ".env") });

  const configPath = path.join(projectRoot, "nubase.config.ts");

  const module = await jiti.import(configPath);
  const config = (
    module && typeof module === "object" && "default" in module
      ? module.default
      : module
  ) as NubaseConfig;

  if (!config.environments || Object.keys(config.environments).length === 0) {
    throw new Error("No environments defined in nubase.config.ts");
  }

  const environmentName =
    envFlag ?? config.defaultEnvironment ?? "local";
  const environment = config.environments[environmentName];

  if (!environment) {
    const available = Object.keys(config.environments).join(", ");
    throw new Error(
      `Environment "${environmentName}" not found. Available: ${available}`,
    );
  }

  const migrationsDir = path.join(projectRoot, "migrations");
  const snapshotsDir = path.join(projectRoot, "snapshots");

  mkdirSync(migrationsDir, { recursive: true });
  mkdirSync(snapshotsDir, { recursive: true });

  return {
    config,
    projectRoot,
    migrationsDir,
    snapshotsDir,
    environmentName,
    environment,
  };
}
