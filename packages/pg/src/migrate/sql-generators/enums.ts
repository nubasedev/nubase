import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function qualifiedName(schema: string, name: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(name)}`;
}

function quoteLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export function generateEnumStatements(diff: SchemaDiff): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  // Create new enums
  for (const [key, enumType] of Object.entries(diff.enums.added)) {
    const qName = qualifiedName(enumType.schema, enumType.name);
    const values = enumType.values.map(quoteLiteral).join(", ");
    statements.push({
      sql: `CREATE TYPE ${qName} AS ENUM (${values});`,
      priority: 110,
      isDestructive: false,
      description: `Create enum type ${key}`,
    });
  }

  // Drop removed enums
  for (const [key, enumType] of Object.entries(diff.enums.removed)) {
    const qName = qualifiedName(enumType.schema, enumType.name);
    statements.push({
      sql: `DROP TYPE ${qName};`,
      priority: 90,
      isDestructive: true,
      description: `Drop enum type ${key}`,
    });
  }

  // Modified enums
  for (const [key, { from, to }] of Object.entries(diff.enums.modified)) {
    const qName = qualifiedName(to.schema, to.name);
    const addedValues = to.values.filter((v) => !from.values.includes(v));
    const removedValues = from.values.filter((v) => !to.values.includes(v));

    if (removedValues.length === 0 && addedValues.length > 0) {
      // Simple case: only adding values
      for (const value of addedValues) {
        statements.push({
          sql: `ALTER TYPE ${qName} ADD VALUE ${quoteLiteral(value)};`,
          priority: 220,
          isDestructive: false,
          description: `Add value '${value}' to enum ${key}`,
        });
      }
    } else if (removedValues.length > 0) {
      // Complex case: values removed - use rename trick
      const oldName = qualifiedName(to.schema, `${to.name}_old`);
      const values = to.values.map(quoteLiteral).join(", ");

      statements.push({
        sql: `ALTER TYPE ${qName} RENAME TO ${quoteIdent(`${to.name}_old`)};`,
        priority: 90,
        isDestructive: true,
        description: `Rename enum ${key} to ${to.name}_old (for recreation)`,
      });
      statements.push({
        sql: `CREATE TYPE ${qName} AS ENUM (${values});`,
        priority: 110,
        isDestructive: false,
        description: `Recreate enum type ${key} with new values`,
      });
      statements.push({
        sql: `DROP TYPE ${oldName};`,
        priority: 90,
        isDestructive: true,
        description: `Drop old enum type ${to.name}_old`,
      });
    }
  }

  return statements;
}
