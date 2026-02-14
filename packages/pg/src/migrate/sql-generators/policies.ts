import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function qualifiedName(schema: string, name: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(name)}`;
}

export function generatePolicyStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  for (const [key, policy] of Object.entries(diff.policies.added)) {
    const qTable = qualifiedName(policy.schema, policy.tableName);
    let sql = `CREATE POLICY ${quoteIdent(policy.name)} ON ${qTable}`;
    sql += policy.permissive ? " AS PERMISSIVE" : " AS RESTRICTIVE";
    sql += ` FOR ${policy.command}`;
    sql += ` TO ${policy.roles.join(", ")}`;
    if (policy.usingExpression) sql += ` USING (${policy.usingExpression})`;
    if (policy.withCheckExpression)
      sql += ` WITH CHECK (${policy.withCheckExpression})`;
    sql += ";";

    statements.push({
      sql,
      priority: 200,
      isDestructive: false,
      description: `Create policy ${key}`,
    });
  }

  for (const [key, policy] of Object.entries(diff.policies.removed)) {
    const qTable = qualifiedName(policy.schema, policy.tableName);
    statements.push({
      sql: `DROP POLICY ${quoteIdent(policy.name)} ON ${qTable};`,
      priority: 10,
      isDestructive: true,
      description: `Drop policy ${key}`,
    });
  }

  for (const [key, { from, to }] of Object.entries(diff.policies.modified)) {
    const qTable = qualifiedName(from.schema, from.tableName);
    statements.push({
      sql: `DROP POLICY ${quoteIdent(from.name)} ON ${qTable};`,
      priority: 10,
      isDestructive: true,
      description: `Drop policy ${key} (for modification)`,
    });

    let sql = `CREATE POLICY ${quoteIdent(to.name)} ON ${qualifiedName(to.schema, to.tableName)}`;
    sql += to.permissive ? " AS PERMISSIVE" : " AS RESTRICTIVE";
    sql += ` FOR ${to.command}`;
    sql += ` TO ${to.roles.join(", ")}`;
    if (to.usingExpression) sql += ` USING (${to.usingExpression})`;
    if (to.withCheckExpression)
      sql += ` WITH CHECK (${to.withCheckExpression})`;
    sql += ";";

    statements.push({
      sql,
      priority: 200,
      isDestructive: false,
      description: `Recreate policy ${key}`,
    });
  }

  return statements;
}
