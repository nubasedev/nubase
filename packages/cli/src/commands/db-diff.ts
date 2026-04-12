import {
  extractSchema,
  diffSchemas,
  generateMigration,
} from "@nubase/pg";
import type { PgSchema } from "@nubase/pg";
import { loadConfig } from "../config/load-config.js";
import { loadSnapshot, saveSnapshot } from "../db/snapshot.js";
import { writeMigrationFile } from "../db/migration-files.js";
import { printDiff } from "../output/diff-printer.js";
import { log } from "../output/logger.js";

function emptySchema(): PgSchema {
  return {
    pgVersion: "",
    databaseName: "",
    extractedAt: new Date().toISOString(),
    tables: {},
    enums: {},
    sequences: {},
    views: {},
    materializedViews: {},
    functions: {},
    triggers: {},
    extensions: {},
    domains: {},
    collations: {},
    policies: {},
    privileges: {},
  };
}

export async function dbDiff(options: {
  env?: string;
  file?: string;
}): Promise<void> {
  const resolved = await loadConfig(options.env);

  log.step(
    `Comparing schema for "${resolved.environmentName}"`,
  );

  const liveSchema = await extractSchema(resolved.environment.url);
  const snapshot =
    (await loadSnapshot(resolved.snapshotsDir)) ?? emptySchema();

  const diff = diffSchemas(snapshot, liveSchema);
  printDiff(diff);

  if (options.file && diff.hasDifferences) {
    const result = generateMigration(diff, { includeDestructive: true });
    if (result.statements.length > 0) {
      const sql = result.statements.join("\n\n");
      const filePath = writeMigrationFile(
        resolved.migrationsDir,
        options.file,
        sql,
      );
      log.success(`Migration saved: ${filePath}`);

      // Update snapshot after generating migration. The user explicitly asked
      // to capture the live state as a migration, so the live state is now the
      // new intended state. See ADR 0005 for when the snapshot is updated.
      await saveSnapshot(resolved.snapshotsDir, liveSchema);
      log.success("Snapshot updated");
    }

    if (result.warnings.length > 0) {
      log.warn("Destructive operations included:");
      for (const w of result.warnings) {
        log.warn(`  ${w.description}`);
      }
    }
  }
}
