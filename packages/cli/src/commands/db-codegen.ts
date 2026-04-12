import path from "node:path";
import { loadConfig } from "../config/load-config.js";
import { log } from "../output/logger.js";

export async function dbCodegen(options: {
  env?: string;
  out?: string;
}): Promise<void> {
  const resolved = await loadConfig(options.env);

  const appRoot = path.dirname(resolved.projectRoot);
  const outFile =
    options.out ??
    path.join(appRoot, "src", "backend", "db", "db-types.ts");

  log.step(
    `Generating Kysely types from "${resolved.environmentName}"`,
  );

  // Dynamic import to avoid pulling kysely-codegen into the main bundle
  // when it's not needed
  const { Cli } = await import("kysely-codegen");

  const cli = new Cli();
  await cli.generate({
    url: resolved.environment.url,
    dialect: "postgres",
    outFile,
    camelCase: true,
    logLevel: "silent",
  });

  log.success(`Types generated: ${path.relative(process.cwd(), outFile)}`);
}
