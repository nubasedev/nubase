import { findAppProjectRoot } from "../config/load-app-config.js";
import { log } from "../output/logger.js";
import { addRemote, loadRemotes, saveRemotes } from "../remotes/remotes-file.js";

interface RemoteAddOptions {
  url: string;
  workspace: string;
  token?: string;
}

export async function remoteAdd(
  name: string,
  options: RemoteAddOptions,
): Promise<void> {
  const projectRoot = findAppProjectRoot();
  const config = loadRemotes(projectRoot);

  const remote = {
    url: options.url,
    workspace: options.workspace,
    ...(options.token ? { token: options.token } : {}),
  };

  const updated = addRemote(config, name, remote);
  saveRemotes(projectRoot, updated);

  log.success(`Remote "${name}" added (${options.url}, workspace: ${options.workspace})`);
  if (updated.active === name) {
    log.dim(`  Set as active remote`);
  }
}
