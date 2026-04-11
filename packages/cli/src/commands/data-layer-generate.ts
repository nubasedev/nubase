import * as path from "node:path";
import { generateAll } from "@nubase/pg";
import { loadConfig } from "../config/load-config.js";
import { log } from "../output/logger.js";

interface DataLayerGenerateOptions {
  env?: string;
  check?: boolean;
}

export async function dataLayerGenerate(
  options: DataLayerGenerateOptions,
): Promise<void> {
  const resolved = await loadConfig(options.env);

  // The config file lives at `<appRoot>/nubase/nubase.config.ts`. The
  // data-layer directory is resolved relative to the *app root* — the
  // parent of the nubase/ config folder — matching how the runtime
  // resolves other paths.
  const appRoot = path.dirname(resolved.projectRoot);
  const dirSetting = resolved.config.dataLayer?.dir ?? "src/backend/data-layer";
  const dataLayerDir = path.resolve(appRoot, dirSetting);

  log.step(
    `${options.check ? "Checking" : "Generating"} data-layer .ts files in ${dataLayerDir}`,
  );

  const result = await generateAll({
    databaseUrl: resolved.environment.url,
    dataLayerDir,
    check: options.check,
  });

  for (const w of result.warnings) {
    log.warn(`${w.path}: ${w.reason}`);
  }

  for (const err of result.errors) {
    // The diagnostic is already fully formatted (file path, code, context,
    // caret, hint). Print it as-is.
    process.stderr.write(`\n${err.diagnostic}\n`);
  }

  if (options.check) {
    if (result.stale.length > 0) {
      for (const p of result.stale) {
        log.error(`Stale: ${path.relative(process.cwd(), p)}`);
      }
    }
    const ok = result.errors.length === 0 && result.stale.length === 0;
    if (ok) {
      log.success(
        `${result.unchanged.length} queries up to date (${result.durationMs}ms)`,
      );
    } else {
      log.error(
        `Check failed — ${result.errors.length} parse errors, ${result.stale.length} stale files`,
      );
      process.exitCode = 1;
    }
    return;
  }

  if (result.errors.length > 0) {
    log.error(
      `${result.errors.length} queries failed, ${result.generated.length + result.unchanged.length} ok (${result.durationMs}ms)`,
    );
    process.exitCode = 1;
    return;
  }

  for (const p of result.deleted) {
    log.dim(`  deleted orphan: ${path.relative(process.cwd(), p)}`);
  }
  log.success(
    `${result.generated.length} generated, ${result.unchanged.length} unchanged, ${result.deleted.length} orphans removed (${result.durationMs}ms)`,
  );
}
