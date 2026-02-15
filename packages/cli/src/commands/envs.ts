import path from "node:path";
import chalk from "chalk";
import { loadConfig } from "../config/load-config.js";

export async function envs(): Promise<void> {
  const resolved = await loadConfig();
  const configPath = path.join(resolved.projectRoot, "nubase.config.ts");

  console.log(chalk.bold("Environments:\n"));

  for (const [name, env] of Object.entries(resolved.config.environments)) {
    const isDefault = name === (resolved.config.defaultEnvironment ?? "local");
    const maskedUrl = env.url
      ? env.url.replace(/\/\/.*@/, "//***@")
      : chalk.dim("(not set)");
    const label = isDefault
      ? `  ${chalk.green(name)} ${chalk.dim("(default)")}`
      : `  ${name}`;
    console.log(`${label}  ${chalk.dim(maskedUrl)}`);
  }

  console.log(
    `\nTo add or remove environments, edit:\n  ${chalk.cyan(path.relative(process.cwd(), configPath))}`,
  );
}
