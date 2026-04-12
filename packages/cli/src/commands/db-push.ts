import { Migrator } from "kysely";
import prompts from "prompts";
import { loadConfig } from "../config/load-config.js";
import { createKysely } from "../db/kysely.js";
import { NubaseMigrationProvider } from "../db/migration-provider.js";
import { log } from "../output/logger.js";

export async function dbPush(options: {
  env?: string;
  dryRun?: boolean;
  yes?: boolean;
}): Promise<void> {
  const resolved = await loadConfig(options.env);

  log.step(
    `Pushing migrations to "${resolved.environmentName}"`,
  );

  const db = createKysely(resolved.environment.url);

  try {
    const migrator = new Migrator({
      db,
      provider: new NubaseMigrationProvider(resolved.migrationsDir),
    });

    const allMigrations = await migrator.getMigrations();
    const pending = allMigrations.filter((m) => !m.executedAt);

    if (pending.length === 0) {
      log.success("No pending migrations.");
      return;
    }

    log.info(`${pending.length} pending migration(s):`);
    for (const m of pending) {
      log.dim(`  ${m.name}`);
    }

    if (options.dryRun) {
      log.info("Dry run — no changes applied.");
      return;
    }

    if (!options.yes) {
      const { confirm } = await prompts({
        type: "confirm",
        name: "confirm",
        message: `Apply ${pending.length} migration(s) to "${resolved.environmentName}"?`,
        initial: true,
      });
      if (!confirm) {
        log.warn("Aborted.");
        return;
      }
    }

    const { error, results } = await migrator.migrateToLatest();

    if (results) {
      for (const result of results) {
        if (result.status === "Success") {
          log.success(`Applied ${result.migrationName}`);
        } else if (result.status === "Error") {
          log.error(`Failed ${result.migrationName}`);
        }
      }
    }

    if (error) {
      throw error;
    }

    // Intentionally does NOT re-extract and save the snapshot after applying
    // migrations. The snapshot represents the intended schema state, which is
    // defined by the migrations themselves — if the migrations apply cleanly,
    // the target's state now matches the snapshot by construction. Re-extracting
    // would let any drift on the target (manual ALTERs, etc.) silently overwrite
    // the canonical snapshot with corrupted data. See ADR 0005.
  } finally {
    await db.destroy();
  }
}
