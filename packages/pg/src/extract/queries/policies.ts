import type { Client } from "pg";
import type { PgRlsPolicy } from "../../types/schema";

export async function extractPolicies(
  client: Client,
): Promise<Record<string, PgRlsPolicy>> {
  const result = await client.query(`
    SELECT
      n.nspname AS schema_name,
      pol.polname AS policy_name,
      c.relname AS table_name,
      pol.polpermissive AS is_permissive,
      CASE WHEN pol.polroles = '{0}'
        THEN ARRAY['PUBLIC']
        ELSE array_agg(r.rolname ORDER BY r.rolname)
      END AS roles,
      CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
      END AS command,
      pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
      pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression
    FROM pg_catalog.pg_policy pol
    JOIN pg_catalog.pg_class c ON c.oid = pol.polrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_catalog.pg_roles r ON r.oid = ANY(pol.polroles) AND pol.polroles != '{0}'
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
    GROUP BY n.nspname, pol.polname, c.relname, pol.polpermissive, pol.polcmd,
             pol.polqual, pol.polrelid, pol.polwithcheck, pol.polroles
    ORDER BY n.nspname, c.relname, pol.polname
  `);

  const policies: Record<string, PgRlsPolicy> = {};
  for (const row of result.rows) {
    const key = `${row.schema_name}.${row.policy_name}`;
    policies[key] = {
      schema: row.schema_name,
      name: row.policy_name,
      tableName: row.table_name,
      permissive: row.is_permissive,
      roles: row.roles,
      command: row.command,
      usingExpression: row.using_expression ?? null,
      withCheckExpression: row.with_check_expression ?? null,
    };
  }
  return policies;
}
