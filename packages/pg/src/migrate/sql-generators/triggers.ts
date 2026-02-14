import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function qualifiedName(schema: string, name: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(name)}`;
}

export function generateTriggerStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  for (const [key, trigger] of Object.entries(diff.triggers.added)) {
    statements.push({
      sql: `${trigger.definition};`,
      priority: 190,
      isDestructive: false,
      description: `Create trigger ${key}`,
    });
  }

  for (const [key, trigger] of Object.entries(diff.triggers.removed)) {
    const qTable = qualifiedName(trigger.schema, trigger.tableName);
    statements.push({
      sql: `DROP TRIGGER ${quoteIdent(trigger.name)} ON ${qTable};`,
      priority: 20,
      isDestructive: true,
      description: `Drop trigger ${key}`,
    });
  }

  for (const [key, { from, to }] of Object.entries(diff.triggers.modified)) {
    const qTable = qualifiedName(from.schema, from.tableName);
    statements.push({
      sql: `DROP TRIGGER ${quoteIdent(from.name)} ON ${qTable};`,
      priority: 20,
      isDestructive: true,
      description: `Drop trigger ${key} (for modification)`,
    });
    statements.push({
      sql: `${to.definition};`,
      priority: 190,
      isDestructive: false,
      description: `Recreate trigger ${key}`,
    });
  }

  return statements;
}
