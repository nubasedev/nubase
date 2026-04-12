import { Migrator, sql } from "kysely";
import prompts from "prompts";
import { loadConfig } from "../config/load-config.js";
import { createKysely } from "../db/kysely.js";
import { NubaseMigrationProvider } from "../db/migration-provider.js";
import { log } from "../output/logger.js";

export async function dbReset(options: {
  env?: string;
  force?: boolean;
  yes?: boolean;
}): Promise<void> {
  const resolved = await loadConfig(options.env);

  if (resolved.environmentName !== "local" && !options.force) {
    log.error(
      `Refusing to reset non-local environment "${resolved.environmentName}". Use --force to override.`,
    );
    process.exitCode = 1;
    return;
  }

  log.warn(
    `This will DROP and recreate the public schema on "${resolved.environmentName}"`,
  );

  if (!options.yes) {
    const { confirm } = await prompts({
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to reset "${resolved.environmentName}"?`,
      initial: false,
    });
    if (!confirm) {
      log.warn("Aborted.");
      return;
    }
  }

  const db = createKysely(resolved.environment.url);

  try {
    log.step("Dropping and recreating public schema...");
    await sql`DROP SCHEMA public CASCADE`.execute(db);
    await sql`CREATE SCHEMA public`.execute(db);

    const migrator = new Migrator({
      db,
      provider: new NubaseMigrationProvider(resolved.migrationsDir),
    });

    const allMigrations = await migrator.getMigrations();
    const totalCount = allMigrations.length;

    if (totalCount > 0) {
      log.step(`Replaying ${totalCount} migration(s)...`);

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
    }

    // Intentionally does NOT re-extract and save the snapshot after reset.
    // Reset drops and replays migrations — the resulting state is defined by
    // the migrations, which is precisely what the snapshot already represents.
    // Re-extracting would let any generator round-trip artifacts or drift
    // silently overwrite the canonical snapshot. See ADR 0005.
    log.success("Database reset complete.");
  } finally {
    await db.destroy();
  }
}
