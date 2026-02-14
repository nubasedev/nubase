import type { Client } from "pg";
import type { PgMaterializedView, PgView } from "../../types/schema";

export async function extractViews(
  client: Client,
): Promise<Record<string, PgView>> {
  const result = await client.query(`
    SELECT
      v.table_schema AS schema_name,
      v.table_name AS view_name,
      v.view_definition AS definition,
      array_agg(c.column_name::text ORDER BY c.ordinal_position) AS columns,
      d.description AS comment
    FROM information_schema.views v
    JOIN information_schema.columns c ON c.table_schema = v.table_schema AND c.table_name = v.table_name
    LEFT JOIN pg_catalog.pg_class cls ON cls.relname = v.table_name
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = cls.relnamespace AND n.nspname = v.table_schema
    LEFT JOIN pg_catalog.pg_description d ON d.objoid = cls.oid AND d.objsubid = 0
    WHERE v.table_schema NOT IN ('pg_catalog', 'information_schema')
    GROUP BY v.table_schema, v.table_name, v.view_definition, d.description
    ORDER BY v.table_schema, v.table_name
  `);

  const views: Record<string, PgView> = {};
  for (const row of result.rows) {
    const key = `${row.schema_name}.${row.view_name}`;
    views[key] = {
      schema: row.schema_name,
      name: row.view_name,
      definition: row.definition,
      columns: row.columns,
      comment: row.comment ?? null,
    };
  }
  return views;
}

export async function extractMaterializedViews(
  client: Client,
): Promise<Record<string, PgMaterializedView>> {
  const result = await client.query(`
    SELECT
      n.nspname AS schema_name,
      c.relname AS view_name,
      pg_get_viewdef(c.oid, true) AS definition,
      array_agg(a.attname::text ORDER BY a.attnum) FILTER (WHERE a.attnum > 0 AND NOT a.attisdropped) AS columns,
      d.description AS comment
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
    LEFT JOIN pg_catalog.pg_description d ON d.objoid = c.oid AND d.objsubid = 0
    WHERE c.relkind = 'm'
      AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    GROUP BY n.nspname, c.relname, c.oid, d.description
    ORDER BY n.nspname, c.relname
  `);

  const matViews: Record<string, PgMaterializedView> = {};
  for (const row of result.rows) {
    const key = `${row.schema_name}.${row.view_name}`;
    matViews[key] = {
      schema: row.schema_name,
      name: row.view_name,
      definition: row.definition,
      columns: row.columns ?? [],
      indexes: {},
      comment: row.comment ?? null,
    };
  }
  return matViews;
}
