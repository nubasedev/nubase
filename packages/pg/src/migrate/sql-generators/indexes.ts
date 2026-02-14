import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

export function generateIndexStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  // Indexes on modified tables
  for (const [tableKey, tableDiff] of Object.entries(diff.tables.modified)) {
    for (const [, idx] of Object.entries(tableDiff.indexes.removed)) {
      if (idx.isPrimaryKey) continue; // PKs handled via constraints
      statements.push({
        sql: `DROP INDEX ${quoteIdent(idx.schema)}.${quoteIdent(idx.name)};`,
        priority: 50,
        isDestructive: true,
        description: `Drop index ${idx.name} from ${tableKey}`,
      });
    }

    for (const [, idx] of Object.entries(tableDiff.indexes.added)) {
      if (idx.isPrimaryKey) continue;
      statements.push({
        sql: `${idx.definition};`,
        priority: 160,
        isDestructive: false,
        description: `Create index ${idx.name} on ${tableKey}`,
      });
    }

    for (const [, { from, to }] of Object.entries(tableDiff.indexes.modified)) {
      if (from.isPrimaryKey || to.isPrimaryKey) continue;
      statements.push({
        sql: `DROP INDEX ${quoteIdent(from.schema)}.${quoteIdent(from.name)};`,
        priority: 50,
        isDestructive: true,
        description: `Drop index ${from.name} from ${tableKey} (for modification)`,
      });
      statements.push({
        sql: `${to.definition};`,
        priority: 160,
        isDestructive: false,
        description: `Recreate index ${to.name} on ${tableKey}`,
      });
    }
  }

  // Indexes on new tables
  for (const [tableKey, table] of Object.entries(diff.tables.added)) {
    // Build a set of constraint names — their backing indexes are created automatically
    const constraintNames = new Set(
      Object.values(table.constraints).map((c) => c.name),
    );
    for (const [, idx] of Object.entries(table.indexes)) {
      if (idx.isPrimaryKey) continue;
      if (constraintNames.has(idx.name)) continue;
      statements.push({
        sql: `${idx.definition};`,
        priority: 160,
        isDestructive: false,
        description: `Create index ${idx.name} on new table ${tableKey}`,
      });
    }
  }

  return statements;
}
