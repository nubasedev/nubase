import { findAppProjectRoot } from "../config/load-app-config.js";
import { log } from "../output/logger.js";
import {
  loadRemotes,
  saveRemotes,
  setActiveRemote,
} from "../remotes/remotes-file.js";

export async function remoteUse(name: string): Promise<void> {
  const projectRoot = findAppProjectRoot();
  const config = loadRemotes(projectRoot);
  const updated = setActiveRemote(config, name);
  saveRemotes(projectRoot, updated);
  log.success(`Active remote set to "${name}"`);
}
