import chalk from "chalk";
import { findAppProjectRoot } from "../config/load-app-config.js";
import { log } from "../output/logger.js";
import { loadRemotes } from "../remotes/remotes-file.js";

export async function remoteList(): Promise<void> {
  const projectRoot = findAppProjectRoot();
  const config = loadRemotes(projectRoot);

  const names = Object.keys(config.remotes);
  if (names.length === 0) {
    log.info("No remotes configured. Run `nubase remote add` to add one.");
    return;
  }

  for (const name of names) {
    const remote = config.remotes[name];
    const isActive = name === config.active;
    const marker = isActive ? chalk.green("* ") : "  ";
    const label = isActive ? chalk.bold(name) : name;
    console.log(`${marker}${label}  ${remote.url}  (${remote.workspace})`);
  }
}
