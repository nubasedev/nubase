import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

export function generateExtensionStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  for (const [key, ext] of Object.entries(diff.extensions.added)) {
    let sql = `CREATE EXTENSION IF NOT EXISTS ${quoteIdent(ext.name)}`;
    if (ext.schema) sql += ` SCHEMA ${quoteIdent(ext.schema)}`;
    sql += ";";

    statements.push({
      sql,
      priority: 100,
      isDestructive: false,
      description: `Create extension ${key}`,
    });
  }

  for (const [key, ext] of Object.entries(diff.extensions.removed)) {
    statements.push({
      sql: `DROP EXTENSION IF EXISTS ${quoteIdent(ext.name)};`,
      priority: 95,
      isDestructive: true,
      description: `Drop extension ${key}`,
    });
  }

  for (const [key, { to }] of Object.entries(diff.extensions.modified)) {
    statements.push({
      sql: `ALTER EXTENSION ${quoteIdent(to.name)} UPDATE TO '${to.version}';`,
      priority: 100,
      isDestructive: false,
      description: `Update extension ${key} to version ${to.version}`,
    });
  }

  return statements;
}
