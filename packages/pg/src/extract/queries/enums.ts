import type { Client } from "pg";
import type { PgEnum } from "../../types/schema";

export async function extractEnums(
  client: Client,
): Promise<Record<string, PgEnum>> {
  const result = await client.query(`
    SELECT
      n.nspname AS schema_name,
      t.typname AS enum_name,
      array_agg(e.enumlabel::text ORDER BY e.enumsortorder) AS enum_values,
      d.description AS comment
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    JOIN pg_catalog.pg_enum e ON e.enumtypid = t.oid
    LEFT JOIN pg_catalog.pg_description d ON d.objoid = t.oid AND d.objsubid = 0
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
    GROUP BY n.nspname, t.typname, d.description
    ORDER BY n.nspname, t.typname
  `);

  const enums: Record<string, PgEnum> = {};
  for (const row of result.rows) {
    const key = `${row.schema_name}.${row.enum_name}`;
    enums[key] = {
      schema: row.schema_name,
      name: row.enum_name,
      values: row.enum_values,
      comment: row.comment ?? null,
    };
  }
  return enums;
}
