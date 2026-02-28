import { findAppProjectRoot } from "../config/load-app-config.js";
import { log } from "../output/logger.js";
import { loadRemotes, removeRemote, saveRemotes } from "../remotes/remotes-file.js";

export async function remoteRemove(name: string): Promise<void> {
  const projectRoot = findAppProjectRoot();
  const config = loadRemotes(projectRoot);
  const updated = removeRemote(config, name);
  saveRemotes(projectRoot, updated);
  log.success(`Remote "${name}" removed`);
}
