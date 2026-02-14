import type { Client } from "pg";
import type { PgConstraint } from "../../types/schema";

export async function extractConstraints(
  client: Client,
): Promise<Record<string, PgConstraint[]>> {
  const result = await client.query(`
    SELECT
      n.nspname AS schema_name,
      con.conname AS constraint_name,
      cls.relname AS table_name,
      CASE con.contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
        WHEN 'x' THEN 'EXCLUSION'
      END AS constraint_type,
      array_agg(att.attname::text ORDER BY u.pos) AS columns,
      fn.nspname AS ref_schema,
      fcls.relname AS ref_table,
      (
        SELECT array_agg(fa.attname::text ORDER BY fp.pos)
        FROM unnest(con.confkey) WITH ORDINALITY AS fp(num, pos)
        JOIN pg_catalog.pg_attribute fa ON fa.attrelid = con.confrelid AND fa.attnum = fp.num
      ) AS ref_columns,
      CASE con.confupdtype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        ELSE NULL
      END AS on_update,
      CASE con.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        ELSE NULL
      END AS on_delete,
      pg_get_constraintdef(con.oid) AS check_expression_raw,
      con.condeferrable AS is_deferrable,
      con.condeferred AS is_deferred,
      con.contype AS raw_type
    FROM pg_catalog.pg_constraint con
    JOIN pg_catalog.pg_class cls ON cls.oid = con.conrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = cls.relnamespace
    LEFT JOIN pg_catalog.pg_class fcls ON fcls.oid = con.confrelid
    LEFT JOIN pg_catalog.pg_namespace fn ON fn.oid = fcls.relnamespace
    LEFT JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS u(num, pos) ON TRUE
    LEFT JOIN pg_catalog.pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = u.num
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
    GROUP BY n.nspname, con.conname, cls.relname, con.contype, fn.nspname, fcls.relname,
             con.confkey, con.confrelid, con.confupdtype, con.confdeltype, con.oid,
             con.condeferrable, con.condeferred
    ORDER BY n.nspname, cls.relname, con.conname
  `);

  const byTable: Record<string, PgConstraint[]> = {};

  for (const row of result.rows) {
    const tableKey = `${row.schema_name}.${row.table_name}`;
    if (!byTable[tableKey]) byTable[tableKey] = [];

    const checkExpression =
      row.raw_type === "c" ? row.check_expression_raw : null;

    byTable[tableKey].push({
      schema: row.schema_name,
      name: row.constraint_name,
      tableName: row.table_name,
      type: row.constraint_type,
      columns: row.columns?.filter((c: string | null) => c !== null) ?? [],
      referencedTable: row.ref_table
        ? `${row.ref_schema}.${row.ref_table}`
        : null,
      referencedColumns: row.ref_columns ?? null,
      onUpdate: row.on_update ?? null,
      onDelete: row.on_delete ?? null,
      checkExpression,
      isDeferrable: row.is_deferrable,
      isDeferred: row.is_deferred,
    });
  }

  return byTable;
}
