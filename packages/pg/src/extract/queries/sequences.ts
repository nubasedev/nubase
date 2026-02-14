import type { Client } from "pg";
import type { PgSequence } from "../../types/schema";

export async function extractSequences(
  client: Client,
): Promise<Record<string, PgSequence>> {
  const result = await client.query(`
    SELECT
      s.sequence_schema AS schema_name,
      s.sequence_name,
      s.data_type,
      s.start_value,
      s.increment,
      s.minimum_value,
      s.maximum_value,
      pg_sequences.cache_size,
      pg_sequences.cycle AS is_cyclic,
      d.refobjid IS NOT NULL AS is_owned,
      CASE WHEN d.refobjid IS NOT NULL
        THEN (
          SELECT nsp.nspname || '.' || cl.relname || '.' || att.attname
          FROM pg_catalog.pg_class cl
          JOIN pg_catalog.pg_namespace nsp ON nsp.oid = cl.relnamespace
          JOIN pg_catalog.pg_attribute att ON att.attrelid = cl.oid AND att.attnum = d.refobjsubid
          WHERE cl.oid = d.refobjid
        )
        ELSE NULL
      END AS owned_by
    FROM information_schema.sequences s
    JOIN pg_catalog.pg_sequences ON pg_sequences.schemaname = s.sequence_schema AND pg_sequences.sequencename = s.sequence_name
    LEFT JOIN pg_catalog.pg_class c ON c.relname = s.sequence_name
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace AND n.nspname = s.sequence_schema
    LEFT JOIN pg_catalog.pg_depend d ON d.objid = c.oid AND d.deptype = 'a'
    WHERE s.sequence_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY s.sequence_schema, s.sequence_name
  `);

  const sequences: Record<string, PgSequence> = {};
  for (const row of result.rows) {
    const key = `${row.schema_name}.${row.sequence_name}`;
    sequences[key] = {
      schema: row.schema_name,
      name: row.sequence_name,
      dataType: row.data_type,
      startValue: String(row.start_value),
      increment: String(row.increment),
      minValue: String(row.minimum_value),
      maxValue: String(row.maximum_value),
      cacheSize: String(row.cache_size),
      isCyclic: row.is_cyclic ?? false,
      ownedBy: row.owned_by ?? null,
    };
  }
  return sequences;
}
