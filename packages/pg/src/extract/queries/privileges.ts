import type { Client } from "pg";
import type { PgPrivilege } from "../../types/schema";

export async function extractPrivileges(
  client: Client,
): Promise<Record<string, PgPrivilege>> {
  const result = await client.query(`
    SELECT
      table_schema AS schema_name,
      table_name,
      grantee,
      array_agg(privilege_type ORDER BY privilege_type) AS privileges,
      bool_or(is_grantable = 'YES') AS with_grant_option
    FROM information_schema.table_privileges
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND grantor != grantee
    GROUP BY table_schema, table_name, grantee
    ORDER BY table_schema, table_name, grantee
  `);

  const privileges: Record<string, PgPrivilege> = {};
  for (const row of result.rows) {
    const key = `${row.schema_name}.${row.table_name}.${row.grantee}`;
    privileges[key] = {
      objectType: "TABLE",
      objectName: `${row.schema_name}.${row.table_name}`,
      grantee: row.grantee,
      privileges: row.privileges,
      withGrantOption: row.with_grant_option,
    };
  }
  return privileges;
}
