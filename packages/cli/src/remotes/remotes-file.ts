import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RemoteConfig, RemotesConfig } from "./types.js";

const REMOTES_DIR = ".nubase";
const REMOTES_FILE = "remotes.json";

function remotesPath(projectRoot: string): string {
  return path.join(projectRoot, REMOTES_DIR, REMOTES_FILE);
}

export function loadRemotes(projectRoot: string): RemotesConfig {
  const filePath = remotesPath(projectRoot);
  if (!existsSync(filePath)) {
    return { active: null, remotes: {} };
  }
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as RemotesConfig;
}

export function saveRemotes(
  projectRoot: string,
  config: RemotesConfig,
): void {
  const dirPath = path.join(projectRoot, REMOTES_DIR);
  mkdirSync(dirPath, { recursive: true });
  const filePath = remotesPath(projectRoot);
  writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`, "utf-8");
}

export function addRemote(
  config: RemotesConfig,
  name: string,
  remote: RemoteConfig,
): RemotesConfig {
  if (config.remotes[name]) {
    throw new Error(`Remote "${name}" already exists`);
  }
  const remotes = { ...config.remotes, [name]: remote };
  const active = config.active ?? name;
  return { active, remotes };
}

export function removeRemote(
  config: RemotesConfig,
  name: string,
): RemotesConfig {
  if (!config.remotes[name]) {
    throw new Error(`Remote "${name}" does not exist`);
  }
  const { [name]: _, ...remotes } = config.remotes;
  const active = config.active === name ? null : config.active;
  return { active, remotes };
}

export function setActiveRemote(
  config: RemotesConfig,
  name: string,
): RemotesConfig {
  if (!config.remotes[name]) {
    throw new Error(`Remote "${name}" does not exist`);
  }
  return { ...config, active: name };
}

export function getActiveRemote(
  config: RemotesConfig,
): RemoteConfig & { name: string } {
  if (!config.active || !config.remotes[config.active]) {
    throw new Error(
      "No active remote. Run `nubase remote add` to add one.",
    );
  }
  return { name: config.active, ...config.remotes[config.active] };
}
