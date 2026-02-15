import type pg from "pg";

const MIGRATIONS_TABLE = "_nubase_migrations";

export async function ensureMigrationsTable(client: pg.Client): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export async function getAppliedMigrations(
  client: pg.Client,
): Promise<Set<string>> {
  const result = await client.query<{ name: string }>(
    `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id`,
  );
  return new Set(result.rows.map((row) => row.name));
}

export async function recordMigration(
  client: pg.Client,
  name: string,
): Promise<void> {
  await client.query(
    `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`,
    [name],
  );
}
