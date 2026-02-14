import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function qualifiedName(schema: string, name: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(name)}`;
}

export function generateTableStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  // Create new tables
  for (const [key, table] of Object.entries(diff.tables.added)) {
    const qName = qualifiedName(table.schema, table.name);
    const columnDefs = Object.values(table.columns)
      .sort((a, b) => a.ordinalPosition - b.ordinalPosition)
      .map((col) => {
        let typeName = col.dataType;
        if (col.characterMaxLength !== null) {
          typeName = `${col.udtName}(${col.characterMaxLength})`;
        } else if (col.dataType === "USER-DEFINED") {
          typeName = col.udtName;
        } else if (col.dataType === "ARRAY") {
          typeName = `${col.udtName.replace(/^_/, "")}[]`;
        }
        let def = `  ${quoteIdent(col.name)} ${typeName}`;
        if (col.isIdentity) {
          def += ` GENERATED ${col.identityGeneration === "ALWAYS" ? "ALWAYS" : "BY DEFAULT"} AS IDENTITY`;
        }
        if (!col.isNullable) def += " NOT NULL";
        if (col.defaultValue !== null && !col.isIdentity)
          def += ` DEFAULT ${col.defaultValue}`;
        return def;
      });

    statements.push({
      sql: `CREATE TABLE ${qName} (\n${columnDefs.join(",\n")}\n);`,
      priority: 130,
      isDestructive: false,
      description: `Create table ${key}`,
    });

    // RLS
    if (table.rlsEnabled) {
      statements.push({
        sql: `ALTER TABLE ${qName} ENABLE ROW LEVEL SECURITY;`,
        priority: 131,
        isDestructive: false,
        description: `Enable RLS on ${key}`,
      });
    }
    if (table.rlsForced) {
      statements.push({
        sql: `ALTER TABLE ${qName} FORCE ROW LEVEL SECURITY;`,
        priority: 131,
        isDestructive: false,
        description: `Force RLS on ${key}`,
      });
    }
  }

  // Drop removed tables
  for (const [key, table] of Object.entries(diff.tables.removed)) {
    const qName = qualifiedName(table.schema, table.name);
    statements.push({
      sql: `DROP TABLE ${qName};`,
      priority: 80,
      isDestructive: true,
      description: `Drop table ${key}`,
    });
  }

  // Handle RLS changes on modified tables
  for (const [key, tableDiff] of Object.entries(diff.tables.modified)) {
    if (tableDiff.rlsChanged) {
      const qName = qualifiedName(tableDiff.to.schema, tableDiff.to.name);
      if (tableDiff.to.rlsEnabled !== tableDiff.from.rlsEnabled) {
        statements.push({
          sql: `ALTER TABLE ${qName} ${tableDiff.to.rlsEnabled ? "ENABLE" : "DISABLE"} ROW LEVEL SECURITY;`,
          priority: 131,
          isDestructive: !tableDiff.to.rlsEnabled,
          description: `${tableDiff.to.rlsEnabled ? "Enable" : "Disable"} RLS on ${key}`,
        });
      }
      if (tableDiff.to.rlsForced !== tableDiff.from.rlsForced) {
        statements.push({
          sql: `ALTER TABLE ${qName} ${tableDiff.to.rlsForced ? "FORCE" : "NO FORCE"} ROW LEVEL SECURITY;`,
          priority: 131,
          isDestructive: !tableDiff.to.rlsForced,
          description: `${tableDiff.to.rlsForced ? "Force" : "Unforce"} RLS on ${key}`,
        });
      }
    }
  }

  return statements;
}
