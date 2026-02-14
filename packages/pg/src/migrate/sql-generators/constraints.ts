import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function qualifiedName(schema: string, name: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(name)}`;
}

export function generateConstraintStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  for (const [tableKey, tableDiff] of Object.entries(diff.tables.modified)) {
    const qTable = qualifiedName(tableDiff.to.schema, tableDiff.to.name);

    // Drop removed constraints
    for (const [, con] of Object.entries(tableDiff.constraints.removed)) {
      statements.push({
        sql: `ALTER TABLE ${qTable} DROP CONSTRAINT ${quoteIdent(con.name)};`,
        priority: 60,
        isDestructive: true,
        description: `Drop constraint ${con.name} from ${tableKey}`,
      });
    }

    // Add new constraints
    for (const [, con] of Object.entries(tableDiff.constraints.added)) {
      let constraintDef: string;
      switch (con.type) {
        case "PRIMARY KEY":
          constraintDef = `PRIMARY KEY (${con.columns.map(quoteIdent).join(", ")})`;
          break;
        case "UNIQUE":
          constraintDef = `UNIQUE (${con.columns.map(quoteIdent).join(", ")})`;
          break;
        case "FOREIGN KEY":
          constraintDef = `FOREIGN KEY (${con.columns.map(quoteIdent).join(", ")}) REFERENCES ${con.referencedTable} (${(con.referencedColumns ?? []).map(quoteIdent).join(", ")})`;
          if (con.onUpdate) constraintDef += ` ON UPDATE ${con.onUpdate}`;
          if (con.onDelete) constraintDef += ` ON DELETE ${con.onDelete}`;
          break;
        case "CHECK":
          constraintDef = con.checkExpression ?? `CHECK (true)`;
          break;
        case "EXCLUSION":
          constraintDef = con.checkExpression ?? `EXCLUDE USING gist ()`;
          break;
        default:
          continue;
      }

      if (con.isDeferrable) constraintDef += " DEFERRABLE";
      if (con.isDeferred) constraintDef += " INITIALLY DEFERRED";

      // PK and UNIQUE must be created before FK (which references them)
      const priority =
        con.type === "PRIMARY KEY" || con.type === "UNIQUE" ? 140 : 150;

      statements.push({
        sql: `ALTER TABLE ${qTable} ADD CONSTRAINT ${quoteIdent(con.name)} ${constraintDef};`,
        priority,
        isDestructive: false,
        description: `Add constraint ${con.name} to ${tableKey}`,
      });
    }

    // Modified constraints: drop + recreate
    for (const [, { from, to }] of Object.entries(
      tableDiff.constraints.modified,
    )) {
      statements.push({
        sql: `ALTER TABLE ${qTable} DROP CONSTRAINT ${quoteIdent(from.name)};`,
        priority: 60,
        isDestructive: true,
        description: `Drop constraint ${from.name} from ${tableKey} (for modification)`,
      });

      let constraintDef: string;
      switch (to.type) {
        case "PRIMARY KEY":
          constraintDef = `PRIMARY KEY (${to.columns.map(quoteIdent).join(", ")})`;
          break;
        case "UNIQUE":
          constraintDef = `UNIQUE (${to.columns.map(quoteIdent).join(", ")})`;
          break;
        case "FOREIGN KEY":
          constraintDef = `FOREIGN KEY (${to.columns.map(quoteIdent).join(", ")}) REFERENCES ${to.referencedTable} (${(to.referencedColumns ?? []).map(quoteIdent).join(", ")})`;
          if (to.onUpdate) constraintDef += ` ON UPDATE ${to.onUpdate}`;
          if (to.onDelete) constraintDef += ` ON DELETE ${to.onDelete}`;
          break;
        case "CHECK":
          constraintDef = to.checkExpression ?? `CHECK (true)`;
          break;
        case "EXCLUSION":
          constraintDef = to.checkExpression ?? `EXCLUDE USING gist ()`;
          break;
        default:
          continue;
      }

      if (to.isDeferrable) constraintDef += " DEFERRABLE";
      if (to.isDeferred) constraintDef += " INITIALLY DEFERRED";

      statements.push({
        sql: `ALTER TABLE ${qTable} ADD CONSTRAINT ${quoteIdent(to.name)} ${constraintDef};`,
        priority: 150,
        isDestructive: false,
        description: `Recreate constraint ${to.name} on ${tableKey}`,
      });
    }
  }

  // Also handle constraints for newly added tables (they come inline with CREATE TABLE, but PK/FK etc may need separate statements)
  // Actually, constraints for new tables are included in CREATE TABLE column defs, but explicit constraints need separate statements
  for (const [tableKey, table] of Object.entries(diff.tables.added)) {
    const qTable = qualifiedName(table.schema, table.name);
    for (const [, con] of Object.entries(table.constraints)) {
      let constraintDef: string;
      switch (con.type) {
        case "PRIMARY KEY":
          constraintDef = `PRIMARY KEY (${con.columns.map(quoteIdent).join(", ")})`;
          break;
        case "UNIQUE":
          constraintDef = `UNIQUE (${con.columns.map(quoteIdent).join(", ")})`;
          break;
        case "FOREIGN KEY":
          constraintDef = `FOREIGN KEY (${con.columns.map(quoteIdent).join(", ")}) REFERENCES ${con.referencedTable} (${(con.referencedColumns ?? []).map(quoteIdent).join(", ")})`;
          if (con.onUpdate) constraintDef += ` ON UPDATE ${con.onUpdate}`;
          if (con.onDelete) constraintDef += ` ON DELETE ${con.onDelete}`;
          break;
        case "CHECK":
          constraintDef = con.checkExpression ?? `CHECK (true)`;
          break;
        case "EXCLUSION":
          constraintDef = con.checkExpression ?? `EXCLUDE USING gist ()`;
          break;
        default:
          continue;
      }

      if (con.isDeferrable) constraintDef += " DEFERRABLE";
      if (con.isDeferred) constraintDef += " INITIALLY DEFERRED";

      // PK and UNIQUE must be created before FK (which references them)
      const priority =
        con.type === "PRIMARY KEY" || con.type === "UNIQUE" ? 140 : 150;

      statements.push({
        sql: `ALTER TABLE ${qTable} ADD CONSTRAINT ${quoteIdent(con.name)} ${constraintDef};`,
        priority,
        isDestructive: false,
        description: `Add constraint ${con.name} to new table ${tableKey}`,
      });
    }
  }

  return statements;
}
