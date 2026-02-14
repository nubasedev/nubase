import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function qualifiedName(schema: string, name: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(name)}`;
}

export function generateSequenceStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  for (const [key, seq] of Object.entries(diff.sequences.added)) {
    const qName = qualifiedName(seq.schema, seq.name);
    let sql = `CREATE SEQUENCE ${qName} AS ${seq.dataType}`;
    sql += ` INCREMENT BY ${seq.increment}`;
    sql += ` MINVALUE ${seq.minValue}`;
    sql += ` MAXVALUE ${seq.maxValue}`;
    sql += ` START WITH ${seq.startValue}`;
    sql += ` CACHE ${seq.cacheSize}`;
    sql += seq.isCyclic ? " CYCLE" : " NO CYCLE";
    sql += ";";

    statements.push({
      sql,
      priority: 120,
      isDestructive: false,
      description: `Create sequence ${key}`,
    });

    if (seq.ownedBy) {
      statements.push({
        sql: `ALTER SEQUENCE ${qName} OWNED BY ${seq.ownedBy};`,
        priority: 210,
        isDestructive: false,
        description: `Set ownership of sequence ${key}`,
      });
    }
  }

  for (const [key, seq] of Object.entries(diff.sequences.removed)) {
    const qName = qualifiedName(seq.schema, seq.name);
    statements.push({
      sql: `DROP SEQUENCE ${qName};`,
      priority: 85,
      isDestructive: true,
      description: `Drop sequence ${key}`,
    });
  }

  for (const [key, { to }] of Object.entries(diff.sequences.modified)) {
    const qName = qualifiedName(to.schema, to.name);
    let sql = `ALTER SEQUENCE ${qName}`;
    sql += ` AS ${to.dataType}`;
    sql += ` INCREMENT BY ${to.increment}`;
    sql += ` MINVALUE ${to.minValue}`;
    sql += ` MAXVALUE ${to.maxValue}`;
    sql += ` CACHE ${to.cacheSize}`;
    sql += to.isCyclic ? " CYCLE" : " NO CYCLE";
    sql += ";";

    statements.push({
      sql,
      priority: 210,
      isDestructive: false,
      description: `Alter sequence ${key}`,
    });
  }

  return statements;
}
