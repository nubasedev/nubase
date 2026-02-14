import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { diffSchemas } from "../diff/diff-schemas";
import { extractSchemaFromClient } from "../extract/extract-schema";
import {
  createTestContext,
  destroyTestContext,
  resetDatabase,
  setupSchema,
  type TestContext,
} from "../testing/test-helpers";
import { generateMigration } from "./generate-migration";

describe("generateMigration - integration", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(async () => {
    await destroyTestContext(ctx);
  });

  beforeEach(async () => {
    await Promise.all([resetDatabase(ctx.source), resetDatabase(ctx.target)]);
  });

  /**
   * Helper: applies migration SQL to a client, then extracts and diffs both schemas
   * to verify they are identical.
   */
  async function applyAndVerifyNoDiff(migrationSql: string[]) {
    for (const sql of migrationSql) {
      await ctx.target.query(sql);
    }
    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);
    const diff = diffSchemas(targetSchema, sourceSchema);
    return diff;
  }

  it("round-trip: CREATE TABLE", async () => {
    // Source has a table, target is empty
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true
      );
      `,
    );

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);
    const diff = diffSchemas(targetSchema, sourceSchema);

    expect(diff.hasDifferences).toBe(true);

    const migration = generateMigration(diff, { includeDestructive: true });
    expect(migration.statements.length).toBeGreaterThan(0);
    expect(migration.statements.some((s) => s.includes("CREATE TABLE"))).toBe(
      true,
    );

    const finalDiff = await applyAndVerifyNoDiff(migration.statements);
    expect(finalDiff.hasDifferences).toBe(false);
  });

  it("round-trip: ADD COLUMN to existing table", async () => {
    // Both start with the same table
    const baseSchema = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `;
    await setupSchema(ctx.source, baseSchema);
    await setupSchema(ctx.target, baseSchema);

    // Add a column to source only
    await ctx.source.query(
      `ALTER TABLE users ADD COLUMN email TEXT, ADD COLUMN age INTEGER DEFAULT 0;`,
    );

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);
    const diff = diffSchemas(targetSchema, sourceSchema);

    expect(diff.hasDifferences).toBe(true);

    const migration = generateMigration(diff, { includeDestructive: true });
    expect(migration.statements.some((s) => s.includes("ADD COLUMN"))).toBe(
      true,
    );

    const finalDiff = await applyAndVerifyNoDiff(migration.statements);
    expect(finalDiff.hasDifferences).toBe(false);
  });

  it("round-trip: ADD FOREIGN KEY", async () => {
    // Both have users table
    const baseSchema = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `;
    await setupSchema(ctx.source, baseSchema);
    await setupSchema(ctx.target, baseSchema);

    // Source adds posts table with FK
    await ctx.source.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);
    const diff = diffSchemas(targetSchema, sourceSchema);

    const migration = generateMigration(diff, { includeDestructive: true });

    const finalDiff = await applyAndVerifyNoDiff(migration.statements);
    expect(finalDiff.hasDifferences).toBe(false);
  });

  it("round-trip: CREATE ENUM and table using it", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TYPE status AS ENUM ('draft', 'active', 'archived');
      CREATE TABLE tickets (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        status status NOT NULL DEFAULT 'draft'
      );
      `,
    );

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);
    const diff = diffSchemas(targetSchema, sourceSchema);

    const migration = generateMigration(diff, { includeDestructive: true });

    const finalDiff = await applyAndVerifyNoDiff(migration.statements);
    expect(finalDiff.hasDifferences).toBe(false);
  });

  it("round-trip: CREATE VIEW", async () => {
    // Both have users table
    const baseSchema = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true
      );
    `;
    await setupSchema(ctx.source, baseSchema);
    await setupSchema(ctx.target, baseSchema);

    // Source adds a view
    await ctx.source.query(
      `CREATE VIEW active_users AS SELECT id, name FROM users WHERE is_active = true;`,
    );

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);
    const diff = diffSchemas(targetSchema, sourceSchema);

    const migration = generateMigration(diff, { includeDestructive: true });

    const finalDiff = await applyAndVerifyNoDiff(migration.statements);
    expect(finalDiff.hasDifferences).toBe(false);
  });

  it("round-trip: CREATE FUNCTION and TRIGGER", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      CREATE FUNCTION set_updated_at() RETURNS TRIGGER
      LANGUAGE plpgsql AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$;
      CREATE TRIGGER trg_users_updated
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      `,
    );

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);
    const diff = diffSchemas(targetSchema, sourceSchema);

    const migration = generateMigration(diff, { includeDestructive: true });

    const finalDiff = await applyAndVerifyNoDiff(migration.statements);
    expect(finalDiff.hasDifferences).toBe(false);
  });

  it("destructive filtering: DROP TABLE excluded by default", async () => {
    // Target has a table, source is empty
    await setupSchema(
      ctx.target,
      `
      CREATE TABLE obsolete (
        id SERIAL PRIMARY KEY,
        data TEXT
      );
      `,
    );

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);
    const diff = diffSchemas(targetSchema, sourceSchema);

    expect(diff.hasDifferences).toBe(true);

    // Without includeDestructive (default)
    const safeResult = generateMigration(diff);
    expect(safeResult.statements.some((s) => s.includes("DROP"))).toBe(false);
    expect(safeResult.warnings.length).toBeGreaterThan(0);
    expect(safeResult.warnings.some((w) => w.isDestructive)).toBe(true);

    // With includeDestructive
    const fullResult = generateMigration(diff, { includeDestructive: true });
    expect(fullResult.statements.some((s) => s.includes("DROP TABLE"))).toBe(
      true,
    );
  });

  it("round-trip: complex schema with multiple object types", async () => {
    await setupSchema(
      ctx.source,
      `
      -- Extension
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      -- Enum
      CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'critical');

      -- Domain
      CREATE DOMAIN positive_int AS INTEGER DEFAULT 0 CHECK (VALUE >= 0);

      -- Tables
      CREATE TABLE users (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name TEXT NOT NULL,
        score positive_int,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE tickets (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title TEXT NOT NULL CHECK (length(title) > 0),
        priority priority NOT NULL DEFAULT 'medium',
        assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Indexes
      CREATE INDEX idx_tickets_priority ON tickets (priority);
      CREATE INDEX idx_tickets_assignee ON tickets (assignee_id) WHERE assignee_id IS NOT NULL;

      -- View
      CREATE VIEW high_priority_tickets AS
        SELECT t.id, t.title, u.name AS assignee_name
        FROM tickets t
        LEFT JOIN users u ON u.id = t.assignee_id
        WHERE t.priority IN ('high', 'critical');

      -- Function
      CREATE FUNCTION ticket_count_for_user(user_id INTEGER) RETURNS INTEGER
      LANGUAGE sql STABLE
      AS $$ SELECT COUNT(*)::INTEGER FROM tickets WHERE assignee_id = user_id $$;

      -- Trigger
      CREATE FUNCTION set_updated_at() RETURNS TRIGGER
      LANGUAGE plpgsql AS $$
      BEGIN
        NEW.created_at = now();
        RETURN NEW;
      END;
      $$;
      CREATE TRIGGER trg_tickets_timestamp
        BEFORE INSERT ON tickets
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();

      -- Standalone sequence
      CREATE SEQUENCE ticket_number_seq START 1000 INCREMENT 1;
      `,
    );

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);
    const diff = diffSchemas(targetSchema, sourceSchema);

    expect(diff.hasDifferences).toBe(true);

    const migration = generateMigration(diff, { includeDestructive: true });
    expect(migration.statements.length).toBeGreaterThan(0);

    const finalDiff = await applyAndVerifyNoDiff(migration.statements);
    expect(finalDiff.hasDifferences).toBe(false);
  });
});
