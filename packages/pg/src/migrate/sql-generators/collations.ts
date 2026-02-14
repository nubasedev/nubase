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

export function generateCollationStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  for (const [key, col] of Object.entries(diff.collations.added)) {
    const qName = qualifiedName(col.schema, col.name);
    let sql = `CREATE COLLATION ${qName} (`;
    sql += `LOCALE = ${quoteLiteral(col.lcCollate)}`;
    sql += `, PROVIDER = ${col.provider}`;
    sql += ");";

    statements.push({
      sql,
      priority: 112,
      isDestructive: false,
      description: `Create collation ${key}`,
    });
  }

  for (const [key, col] of Object.entries(diff.collations.removed)) {
    const qName = qualifiedName(col.schema, col.name);
    statements.push({
      sql: `DROP COLLATION ${qName};`,
      priority: 89,
      isDestructive: true,
      description: `Drop collation ${key}`,
    });
  }

  // Collations can't be altered, so modified means drop + recreate
  for (const [key, { from, to }] of Object.entries(diff.collations.modified)) {
    const qName = qualifiedName(from.schema, from.name);
    statements.push({
      sql: `DROP COLLATION ${qName};`,
      priority: 89,
      isDestructive: true,
      description: `Drop collation ${key} (for recreation)`,
    });

    let sql = `CREATE COLLATION ${qualifiedName(to.schema, to.name)} (`;
    sql += `LOCALE = ${quoteLiteral(to.lcCollate)}`;
    sql += `, PROVIDER = ${to.provider}`;
    sql += ");";

    statements.push({
      sql,
      priority: 112,
      isDestructive: false,
      description: `Recreate collation ${key}`,
    });
  }

  return statements;
}
