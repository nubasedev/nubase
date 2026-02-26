import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { getDataDb } from "../../../db/helpers/drizzle";

/**
 * GET /api/nubase/schema
 *
 * Returns schema metadata for the Data DB, used by `nubase pull` to generate types.
 * Uses raw SQL to introspect the data_db structure (tables, columns, enums).
 */
export const schemaRoutes = new Hono();

schemaRoutes.get("/", async (c) => {
  const dataDb = getDataDb();

  // Query column information from information_schema
  const columnsResult = await dataDb.execute(sql`
    SELECT
      c.table_name,
      c.column_name,
      c.data_type,
      c.udt_name,
      c.is_nullable,
      c.column_default,
      c.is_identity
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_name = c.table_name
      AND t.table_schema = c.table_schema
    WHERE c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
    ORDER BY c.table_name, c.ordinal_position
  `);

  // Query enum types
  const enumsResult = await dataDb.execute(sql`
    SELECT
      t.typname AS enum_name,
      e.enumlabel AS enum_value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    ORDER BY t.typname, e.enumsortorder
  `);

  // Build tables map
  const tables: Record<
    string,
    {
      name: string;
      columns: Record<
        string,
        {
          name: string;
          dataType: string;
          udtName: string;
          isNullable: boolean;
          defaultValue: string | null;
          isIdentity: boolean;
        }
      >;
    }
  > = {};

  for (const row of columnsResult.rows) {
    const tableName = row.table_name as string;
    const columnName = row.column_name as string;

    if (!tables[tableName]) {
      tables[tableName] = { name: tableName, columns: {} };
    }
    tables[tableName].columns[columnName] = {
      name: columnName,
      dataType: row.data_type as string,
      udtName: row.udt_name as string,
      isNullable: (row.is_nullable as string) === "YES",
      defaultValue: (row.column_default as string | null) ?? null,
      isIdentity: (row.is_identity as string) === "YES",
    };
  }

  // Build enums map
  const enums: Record<string, { name: string; values: string[] }> = {};

  for (const row of enumsResult.rows) {
    const enumName = row.enum_name as string;
    const enumValue = row.enum_value as string;

    if (!enums[enumName]) {
      enums[enumName] = { name: enumName, values: [] };
    }
    enums[enumName].values.push(enumValue);
  }

  // Compute schema version hash from the metadata
  const schemaContent = JSON.stringify({ tables, enums });
  const encoder = new TextEncoder();
  const data = encoder.encode(schemaContent);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const schemaVersion = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return c.json({
    schemaVersion,
    tables,
    enums,
  });
});
