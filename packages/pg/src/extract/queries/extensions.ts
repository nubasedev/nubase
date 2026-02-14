import type { Client } from "pg";
import type { PgExtension } from "../../types/schema";

export async function extractExtensions(
  client: Client,
): Promise<Record<string, PgExtension>> {
  const result = await client.query(`
    SELECT
      e.extname AS name,
      n.nspname AS schema_name,
      e.extversion AS version,
      d.description AS comment
    FROM pg_catalog.pg_extension e
    JOIN pg_catalog.pg_namespace n ON n.oid = e.extnamespace
    LEFT JOIN pg_catalog.pg_description d ON d.objoid = e.oid
    WHERE e.extname != 'plpgsql'
    ORDER BY e.extname
  `);

  const extensions: Record<string, PgExtension> = {};
  for (const row of result.rows) {
    extensions[row.name] = {
      name: row.name,
      schema: row.schema_name,
      version: row.version,
      comment: row.comment ?? null,
    };
  }
  return extensions;
}
