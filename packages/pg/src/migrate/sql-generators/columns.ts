import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function qualifiedName(schema: string, name: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(name)}`;
}

export function generateColumnStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  for (const [tableKey, tableDiff] of Object.entries(diff.tables.modified)) {
    const qTable = qualifiedName(tableDiff.to.schema, tableDiff.to.name);

    // Add columns
    for (const [colName, col] of Object.entries(tableDiff.columns.added)) {
      let typeName = col.dataType;
      if (col.characterMaxLength !== null) {
        typeName = `${col.udtName}(${col.characterMaxLength})`;
      } else if (col.dataType === "USER-DEFINED") {
        typeName = col.udtName;
      } else if (col.dataType === "ARRAY") {
        typeName = `${col.udtName.replace(/^_/, "")}[]`;
      }
      let colDef = `${quoteIdent(colName)} ${typeName}`;
      if (col.isIdentity) {
        colDef += ` GENERATED ${col.identityGeneration === "ALWAYS" ? "ALWAYS" : "BY DEFAULT"} AS IDENTITY`;
      }
      if (!col.isNullable) colDef += " NOT NULL";
      if (col.defaultValue !== null && !col.isIdentity)
        colDef += ` DEFAULT ${col.defaultValue}`;

      statements.push({
        sql: `ALTER TABLE ${qTable} ADD COLUMN ${colDef};`,
        priority: 140,
        isDestructive: false,
        description: `Add column ${colName} to ${tableKey}`,
      });
    }

    // Drop columns
    for (const [colName] of Object.entries(tableDiff.columns.removed)) {
      statements.push({
        sql: `ALTER TABLE ${qTable} DROP COLUMN ${quoteIdent(colName)};`,
        priority: 70,
        isDestructive: true,
        description: `Drop column ${colName} from ${tableKey}`,
      });
    }

    // Modify columns
    for (const [colName, mod] of Object.entries(tableDiff.columns.modified)) {
      const qCol = quoteIdent(colName);

      for (const prop of mod.changedProperties) {
        switch (prop) {
          case "dataType":
          case "udtName":
          case "characterMaxLength": {
            let newType = mod.to.dataType;
            if (mod.to.characterMaxLength !== null) {
              newType = `${mod.to.udtName}(${mod.to.characterMaxLength})`;
            } else if (mod.to.dataType === "USER-DEFINED") {
              newType = mod.to.udtName;
            } else if (mod.to.dataType === "ARRAY") {
              newType = `${mod.to.udtName.replace(/^_/, "")}[]`;
            }
            statements.push({
              sql: `ALTER TABLE ${qTable} ALTER COLUMN ${qCol} TYPE ${newType} USING ${qCol}::${newType};`,
              priority: 145,
              isDestructive: false,
              description: `Change type of ${colName} in ${tableKey}`,
            });
            break;
          }
          case "isNullable":
            statements.push({
              sql: `ALTER TABLE ${qTable} ALTER COLUMN ${qCol} ${mod.to.isNullable ? "DROP NOT NULL" : "SET NOT NULL"};`,
              priority: 145,
              isDestructive: false,
              description: `${mod.to.isNullable ? "Allow" : "Disallow"} NULL for ${colName} in ${tableKey}`,
            });
            break;
          case "defaultValue":
            if (mod.to.defaultValue !== null) {
              statements.push({
                sql: `ALTER TABLE ${qTable} ALTER COLUMN ${qCol} SET DEFAULT ${mod.to.defaultValue};`,
                priority: 145,
                isDestructive: false,
                description: `Set default for ${colName} in ${tableKey}`,
              });
            } else {
              statements.push({
                sql: `ALTER TABLE ${qTable} ALTER COLUMN ${qCol} DROP DEFAULT;`,
                priority: 145,
                isDestructive: false,
                description: `Drop default for ${colName} in ${tableKey}`,
              });
            }
            break;
          case "isIdentity":
          case "identityGeneration":
            if (mod.to.isIdentity && !mod.from.isIdentity) {
              statements.push({
                sql: `ALTER TABLE ${qTable} ALTER COLUMN ${qCol} ADD GENERATED ${mod.to.identityGeneration === "ALWAYS" ? "ALWAYS" : "BY DEFAULT"} AS IDENTITY;`,
                priority: 145,
                isDestructive: false,
                description: `Add identity to ${colName} in ${tableKey}`,
              });
            } else if (!mod.to.isIdentity && mod.from.isIdentity) {
              statements.push({
                sql: `ALTER TABLE ${qTable} ALTER COLUMN ${qCol} DROP IDENTITY;`,
                priority: 145,
                isDestructive: false,
                description: `Drop identity from ${colName} in ${tableKey}`,
              });
            } else if (
              mod.to.isIdentity &&
              mod.from.isIdentity &&
              mod.to.identityGeneration !== mod.from.identityGeneration
            ) {
              statements.push({
                sql: `ALTER TABLE ${qTable} ALTER COLUMN ${qCol} SET GENERATED ${mod.to.identityGeneration === "ALWAYS" ? "ALWAYS" : "BY DEFAULT"};`,
                priority: 145,
                isDestructive: false,
                description: `Change identity generation for ${colName} in ${tableKey}`,
              });
            }
            break;
        }
      }
    }
  }

  return statements;
}
