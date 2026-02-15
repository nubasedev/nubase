import { extractSchema } from "@nubase/pg";
import prompts from "prompts";
import { loadConfig } from "../config/load-config.js";
import { withConnection } from "../db/connection.js";
import {
  ensureMigrationsTable,
  recordMigration,
} from "../db/migration-tracker.js";
import { listMigrationFiles } from "../db/migration-files.js";
import { saveSnapshot } from "../db/snapshot.js";
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

  await withConnection(resolved.environment.url, async (client) => {
    log.step("Dropping and recreating public schema...");
    await client.query("DROP SCHEMA public CASCADE");
    await client.query("CREATE SCHEMA public");

    await ensureMigrationsTable(client);

    const migrations = listMigrationFiles(resolved.migrationsDir);
    if (migrations.length > 0) {
      log.step(`Replaying ${migrations.length} migration(s)...`);
      for (const migration of migrations) {
        log.step(`Applying ${migration.filename}...`);
        await client.query("BEGIN");
        try {
          await client.query(migration.sql);
          await recordMigration(client, migration.name);
          await client.query("COMMIT");
          log.success(`Applied ${migration.filename}`);
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      }
    }

    const schema = await extractSchema(resolved.environment.url);
    await saveSnapshot(
      resolved.snapshotsDir,
      resolved.environmentName,
      schema,
    );
    log.success("Database reset complete. Snapshot updated.");
  });
}
