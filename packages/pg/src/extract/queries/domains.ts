import type { Client } from "pg";
import type { PgDomain } from "../../types/schema";

export async function extractDomains(
  client: Client,
): Promise<Record<string, PgDomain>> {
  const result = await client.query(`
    SELECT
      n.nspname AS schema_name,
      t.typname AS domain_name,
      pg_catalog.format_type(t.typbasetype, t.typtypmod) AS data_type,
      t.typdefault AS default_value,
      t.typnotnull AS is_not_null,
      d.description AS comment,
      COALESCE(
        json_agg(
          json_build_object('name', con.conname, 'expression', pg_get_constraintdef(con.oid))
        ) FILTER (WHERE con.oid IS NOT NULL),
        '[]'::json
      ) AS check_constraints
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    LEFT JOIN pg_catalog.pg_constraint con ON con.contypid = t.oid
    LEFT JOIN pg_catalog.pg_description d ON d.objoid = t.oid AND d.objsubid = 0
    WHERE t.typtype = 'd'
      AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    GROUP BY n.nspname, t.typname, t.typbasetype, t.typtypmod, t.typdefault, t.typnotnull, d.description
    ORDER BY n.nspname, t.typname
  `);

  const domains: Record<string, PgDomain> = {};
  for (const row of result.rows) {
    const key = `${row.schema_name}.${row.domain_name}`;
    domains[key] = {
      schema: row.schema_name,
      name: row.domain_name,
      dataType: row.data_type,
      defaultValue: row.default_value ?? null,
      isNullable: !row.is_not_null,
      checkConstraints: row.check_constraints,
      comment: row.comment ?? null,
    };
  }
  return domains;
}
