import type { Client } from "pg";
import type { PgTrigger } from "../../types/schema";

export async function extractTriggers(
  client: Client,
): Promise<Record<string, PgTrigger>> {
  const result = await client.query(`
    SELECT
      n.nspname AS schema_name,
      t.tgname AS trigger_name,
      c.relname AS table_name,
      pg_get_triggerdef(t.oid) AS definition,
      CASE
        WHEN t.tgtype::int & 2 = 2 THEN 'BEFORE'
        WHEN t.tgtype::int & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
      END AS timing,
      array_remove(ARRAY[
        CASE WHEN t.tgtype::int & 4 = 4 THEN 'INSERT' ELSE NULL END,
        CASE WHEN t.tgtype::int & 8 = 8 THEN 'DELETE' ELSE NULL END,
        CASE WHEN t.tgtype::int & 16 = 16 THEN 'UPDATE' ELSE NULL END,
        CASE WHEN t.tgtype::int & 32 = 32 THEN 'TRUNCATE' ELSE NULL END
      ], NULL) AS events,
      p.proname AS function_name,
      CASE WHEN t.tgtype::int & 1 = 1 THEN 'ROW' ELSE 'STATEMENT' END AS level,
      d.description AS comment
    FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_catalog.pg_proc p ON p.oid = t.tgfoid
    LEFT JOIN pg_catalog.pg_description d ON d.objoid = t.oid
    WHERE NOT t.tgisinternal
      AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY n.nspname, c.relname, t.tgname
  `);

  const triggers: Record<string, PgTrigger> = {};
  for (const row of result.rows) {
    const key = `${row.schema_name}.${row.trigger_name}`;
    triggers[key] = {
      schema: row.schema_name,
      name: row.trigger_name,
      tableName: row.table_name,
      definition: row.definition,
      timing: row.timing,
      events: row.events,
      functionName: row.function_name,
      level: row.level,
      comment: row.comment ?? null,
    };
  }
  return triggers;
}
