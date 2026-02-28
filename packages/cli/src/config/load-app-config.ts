import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createJiti } from "jiti";
import { getActiveRemote, loadRemotes } from "../remotes/remotes-file.js";
import type { RemoteConfig } from "../remotes/types.js";

const jiti = createJiti(import.meta.url);

export interface ResolvedAppConfig {
  remote: RemoteConfig & { name: string };
  projectRoot: string;
  typesDir: string;
  entry: string;
}

/**
 * Find and load app configuration from nubase.config.ts and .nubase/remotes.json.
 * Remote (server URL, workspace, token) comes from remotes.json.
 * Output and app settings come from nubase.config.ts.
 */
export async function loadAppConfig(options?: {
  remote?: string;
}): Promise<ResolvedAppConfig> {
  const projectRoot = findAppProjectRoot();

  // Load .env from the project root
  dotenv.config({ path: path.join(projectRoot, ".env") });

  // Load nubase.config.ts for output/app settings
  const configPath = path.join(projectRoot, "nubase.config.ts");
  let output: { typesDir?: string } | undefined;
  let app: { entry?: string } | undefined;

  if (existsSync(configPath)) {
    const module = await jiti.import(configPath);
    const config = (
      module && typeof module === "object" && "default" in module
        ? module.default
        : module
    ) as { output?: { typesDir?: string }; app?: { entry?: string } };
    output = config.output;
    app = config.app;
  }

  // Resolve remote
  const remotesConfig = loadRemotes(projectRoot);
  let remote: RemoteConfig & { name: string };

  if (options?.remote) {
    const namedRemote = remotesConfig.remotes[options.remote];
    if (!namedRemote) {
      throw new Error(
        `Remote "${options.remote}" not found. Run \`nubase remote list\` to see available remotes.`,
      );
    }
    remote = { name: options.remote, ...namedRemote };
  } else {
    remote = getActiveRemote(remotesConfig);
  }

  const typesDir = path.join(
    projectRoot,
    output?.typesDir ?? ".nubase/types",
  );

  const entry = app?.entry ?? "src/index.ts";

  return { remote, projectRoot, typesDir, entry };
}

export function findAppProjectRoot(startDir: string = process.cwd()): string {
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
