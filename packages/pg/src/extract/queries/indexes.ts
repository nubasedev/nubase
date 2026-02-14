import type { Client } from "pg";
import type { PgIndex } from "../../types/schema";

export async function extractIndexes(
  client: Client,
): Promise<Record<string, PgIndex[]>> {
  const result = await client.query(`
    SELECT
      n.nspname AS schema_name,
      ic.relname AS index_name,
      tc.relname AS table_name,
      array_agg(a.attname::text ORDER BY x.ordinality) AS columns,
      ix.indisunique AS is_unique,
      am.amname AS method,
      pg_get_expr(ix.indpred, ix.indrelid) AS where_clause,
      pg_get_indexdef(ix.indexrelid) AS definition,
      ix.indisprimary AS is_primary_key
    FROM pg_catalog.pg_index ix
    JOIN pg_catalog.pg_class ic ON ic.oid = ix.indexrelid
    JOIN pg_catalog.pg_class tc ON tc.oid = ix.indrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = tc.relnamespace
    JOIN pg_catalog.pg_am am ON am.oid = ic.relam
    LEFT JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS x(attnum, ordinality) ON TRUE
    LEFT JOIN pg_catalog.pg_attribute a ON a.attrelid = ix.indrelid AND a.attnum = x.attnum
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    GROUP BY n.nspname, ic.relname, tc.relname, ix.indisunique, am.amname,
             ix.indpred, ix.indrelid, ix.indexrelid, ix.indisprimary
    ORDER BY n.nspname, tc.relname, ic.relname
  `);

  const byTable: Record<string, PgIndex[]> = {};

  for (const row of result.rows) {
    const tableKey = `${row.schema_name}.${row.table_name}`;
    if (!byTable[tableKey]) byTable[tableKey] = [];

    byTable[tableKey].push({
      schema: row.schema_name,
      name: row.index_name,
      tableName: row.table_name,
      columns: row.columns?.filter((c: string | null) => c !== null) ?? [],
      isUnique: row.is_unique,
      method: row.method,
      whereClause: row.where_clause ?? null,
      definition: row.definition,
      isPrimaryKey: row.is_primary_key,
    });
  }

  return byTable;
}
