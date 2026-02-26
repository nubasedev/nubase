import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

export interface AppConfig {
  server: {
    url: string;
    token?: string;
  };
  workspace: string;
  output?: {
    typesDir?: string;
  };
  app?: {
    entry?: string;
  };
}

export interface ResolvedAppConfig {
  config: AppConfig;
  projectRoot: string;
  typesDir: string;
  entry: string;
}

/**
 * Find and load nubase.config.ts from the current directory or parent directories.
 * This is for SDK-style app configs (not the CLI db management configs).
 */
export async function loadAppConfig(): Promise<ResolvedAppConfig> {
  const projectRoot = findAppProjectRoot();

  // Load .env from the project root
  dotenv.config({ path: path.join(projectRoot, ".env") });

  const configPath = path.join(projectRoot, "nubase.config.ts");
  const module = await jiti.import(configPath);
  const config = (
    module && typeof module === "object" && "default" in module
      ? module.default
      : module
  ) as AppConfig;

  if (!config.server?.url) {
    throw new Error("server.url is required in nubase.config.ts");
  }

  if (!config.workspace) {
    throw new Error("workspace is required in nubase.config.ts");
  }

  const typesDir = path.join(
    projectRoot,
    config.output?.typesDir ?? ".nubase/types",
  );

  const entry = config.app?.entry ?? "src/index.ts";

  return {
    config,
    projectRoot,
    typesDir,
    entry,
  };
}

function findAppProjectRoot(startDir: string = process.cwd()): string {
  let current = path.resolve(startDir);

  while (true) {
    const configFile = path.join(current, "nubase.config.ts");

    if (existsSync(configFile)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(
        "Could not find nubase.config.ts. Run this command from within a Nubase app project.",
      );
    }
    current = parent;
  }
}
