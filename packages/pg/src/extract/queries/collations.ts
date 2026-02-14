import type { Client } from "pg";
import type { PgCollation } from "../../types/schema";

export async function extractCollations(
  client: Client,
): Promise<Record<string, PgCollation>> {
  const result = await client.query(`
    SELECT
      n.nspname AS schema_name,
      c.collname AS collation_name,
      c.collcollate AS lc_collate,
      c.collctype AS lc_ctype,
      CASE c.collprovider
        WHEN 'i' THEN 'icu'
        WHEN 'c' THEN 'libc'
        WHEN 'd' THEN 'default'
      END AS provider,
      d.description AS comment
    FROM pg_catalog.pg_collation c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.collnamespace
    LEFT JOIN pg_catalog.pg_description d ON d.objoid = c.oid
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND c.collname NOT IN ('default', 'C', 'POSIX')
    ORDER BY n.nspname, c.collname
  `);

  const collations: Record<string, PgCollation> = {};
  for (const row of result.rows) {
    const key = `${row.schema_name}.${row.collation_name}`;
    collations[key] = {
      schema: row.schema_name,
      name: row.collation_name,
      lcCollate: row.lc_collate,
      lcCtype: row.lc_ctype,
      provider: row.provider,
      comment: row.comment ?? null,
    };
  }
  return collations;
}
