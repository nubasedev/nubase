import { extractSchema } from "@nubase/pg";
import prompts from "prompts";
import { loadConfig } from "../config/load-config.js";
import { withConnection } from "../db/connection.js";
import {
  ensureMigrationsTable,
  getAppliedMigrations,
  recordMigration,
} from "../db/migration-tracker.js";
import { listMigrationFiles } from "../db/migration-files.js";
import { saveSnapshot } from "../db/snapshot.js";
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

  await withConnection(resolved.environment.url, async (client) => {
    await ensureMigrationsTable(client);

    const applied = await getAppliedMigrations(client);
    const allMigrations = listMigrationFiles(resolved.migrationsDir);
    const pending = allMigrations.filter((m) => !applied.has(m.name));

    if (pending.length === 0) {
      log.success("No pending migrations.");
      return;
    }

    log.info(`${pending.length} pending migration(s):`);
    for (const m of pending) {
      log.dim(`  ${m.filename}`);
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

    for (const migration of pending) {
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

    // Update snapshot after applying all migrations
    const schema = await extractSchema(resolved.environment.url);
    await saveSnapshot(
      resolved.snapshotsDir,
      resolved.environmentName,
      schema,
    );
    log.success("Snapshot updated");
  });
}
