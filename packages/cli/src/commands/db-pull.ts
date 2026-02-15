import {
  extractSchema,
  diffSchemas,
  generateMigration,
} from "@nubase/pg";
import type { PgSchema } from "@nubase/pg";
import { loadConfig } from "../config/load-config.js";
import { saveSnapshot } from "../db/snapshot.js";
import { listMigrationFiles, writeMigrationFile } from "../db/migration-files.js";
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

export async function dbPull(options: { env?: string }): Promise<void> {
  const resolved = await loadConfig(options.env);

  log.step(
    `Pulling schema from "${resolved.environmentName}" (${resolved.environment.url.replace(/\/\/.*@/, "//***@")})`,
  );

  const schema = await extractSchema(resolved.environment.url);
  await saveSnapshot(resolved.snapshotsDir, resolved.environmentName, schema);

  log.success(`Snapshot saved for "${resolved.environmentName}"`);

  // If no migrations exist, generate an initial migration
  const migrations = listMigrationFiles(resolved.migrationsDir);
  if (migrations.length === 0) {
    const diff = diffSchemas(emptySchema(), schema);
    if (diff.hasDifferences) {
      const result = generateMigration(diff, { includeDestructive: true });
      if (result.statements.length > 0) {
        const sql = result.statements.join("\n\n");
        const filePath = writeMigrationFile(
          resolved.migrationsDir,
          "initial",
          `-- Initial migration from db pull\n\n${sql}\n`,
        );
        log.success(`Generated initial migration: ${filePath}`);
      }
    }
  }
}
