import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function qualifiedName(schema: string, name: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(name)}`;
}

export function generateFunctionStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  for (const [key, fn] of Object.entries(diff.functions.added)) {
    statements.push({
      sql: `${fn.definition};`,
      priority: 180,
      isDestructive: false,
      description: `Create function ${key}`,
    });
  }

  for (const [key, fn] of Object.entries(diff.functions.removed)) {
    const qName = qualifiedName(fn.schema, fn.name);
    const kind = fn.isProcedure ? "PROCEDURE" : "FUNCTION";
    statements.push({
      sql: `DROP ${kind} ${qName}(${fn.arguments});`,
      priority: 30,
      isDestructive: true,
      description: `Drop function ${key}`,
    });
  }

  for (const [key, { to }] of Object.entries(diff.functions.modified)) {
    // CREATE OR REPLACE for functions
    statements.push({
      sql: `${to.definition};`,
      priority: 180,
      isDestructive: false,
      description: `Replace function ${key}`,
    });
  }

  return statements;
}
