import type { Client } from "pg";
import type { PgFunction } from "../../types/schema";

export async function extractFunctions(
  client: Client,
): Promise<Record<string, PgFunction>> {
  const result = await client.query(`
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS arguments,
      pg_get_function_result(p.oid) AS return_type,
      l.lanname AS language,
      pg_get_functiondef(p.oid) AS definition,
      CASE p.provolatile
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
      END AS volatility,
      p.prosecdef AS security_definer,
      p.prokind = 'p' AS is_procedure,
      d.description AS comment
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_catalog.pg_language l ON l.oid = p.prolang
    LEFT JOIN pg_catalog.pg_description d ON d.objoid = p.oid AND d.objsubid = 0
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND p.proname NOT LIKE 'pg_%'
    ORDER BY n.nspname, p.proname
  `);

  const functions: Record<string, PgFunction> = {};
  for (const row of result.rows) {
    const key = `${row.schema_name}.${row.function_name}(${row.arguments})`;
    functions[key] = {
      schema: row.schema_name,
      name: row.function_name,
      arguments: row.arguments,
      returnType: row.return_type,
      language: row.language,
      definition: row.definition,
      volatility: row.volatility,
      securityDefiner: row.security_definer,
      isProcedure: row.is_procedure,
      comment: row.comment ?? null,
    };
  }
  return functions;
}
