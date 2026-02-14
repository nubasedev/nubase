import type { Client } from "pg";
import type { PgColumn, PgTable } from "../../types/schema";

export async function extractTables(
  client: Client,
): Promise<Record<string, PgTable>> {
  const tablesResult = await client.query(`
    SELECT
      t.table_schema,
      t.table_name,
      c.relrowsecurity as rls_enabled,
      c.relforcerowsecurity as rls_forced,
      d.description as comment
    FROM information_schema.tables t
    JOIN pg_catalog.pg_class c ON c.relname = t.table_name
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
    LEFT JOIN pg_catalog.pg_description d ON d.objoid = c.oid AND d.objsubid = 0
    WHERE t.table_type = 'BASE TABLE'
      AND t.table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY t.table_schema, t.table_name
  `);

  const columnsResult = await client.query(`
    SELECT
      c.table_schema,
      c.table_name,
      c.column_name,
      c.data_type,
      c.udt_name,
      c.is_nullable,
      c.column_default,
      c.is_identity,
      c.identity_generation,
      c.character_maximum_length,
      c.numeric_precision,
      c.numeric_scale,
      c.ordinal_position,
      pgd.description as comment
    FROM information_schema.columns c
    LEFT JOIN pg_catalog.pg_statio_all_tables st ON st.schemaname = c.table_schema AND st.relname = c.table_name
    LEFT JOIN pg_catalog.pg_description pgd ON pgd.objoid = st.relid AND pgd.objsubid = c.ordinal_position
    WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY c.table_schema, c.table_name, c.ordinal_position
  `);

  const tables: Record<string, PgTable> = {};

  for (const row of tablesResult.rows) {
    const key = `${row.table_schema}.${row.table_name}`;
    tables[key] = {
      schema: row.table_schema,
      name: row.table_name,
      columns: {},
      constraints: {},
      indexes: {},
      rlsEnabled: row.rls_enabled ?? false,
      rlsForced: row.rls_forced ?? false,
      comment: row.comment ?? null,
    };
  }

  for (const row of columnsResult.rows) {
    const tableKey = `${row.table_schema}.${row.table_name}`;
    const table = tables[tableKey];
    if (!table) continue;

    const column: PgColumn = {
      name: row.column_name,
      dataType: row.data_type,
      udtName: row.udt_name,
      isNullable: row.is_nullable === "YES",
      defaultValue: row.column_default ?? null,
      isIdentity: row.is_identity === "YES",
      identityGeneration: row.identity_generation ?? null,
      characterMaxLength:
        row.character_maximum_length !== null
          ? Number(row.character_maximum_length)
          : null,
      numericPrecision:
        row.numeric_precision !== null ? Number(row.numeric_precision) : null,
      numericScale:
        row.numeric_scale !== null ? Number(row.numeric_scale) : null,
      ordinalPosition: Number(row.ordinal_position),
      comment: row.comment ?? null,
    };
    table.columns[row.column_name] = column;
  }

  return tables;
}
