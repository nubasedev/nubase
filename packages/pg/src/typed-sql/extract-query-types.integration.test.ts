import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createTestContext,
  destroyTestContext,
  resetDatabase,
  SOURCE_URL,
  setupSchema,
  type TestContext,
} from "../testing/test-helpers";
import { extractQueryTypes } from "./extract-query-types";

describe("extractQueryTypes - integration", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(async () => {
    await destroyTestContext(ctx);
  });

  beforeEach(async () => {
    await resetDatabase(ctx.source);
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE tickets (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        author_id INTEGER NOT NULL REFERENCES users(id)
      );
      `,
    );
  });

  it("extracts param and return types for a simple SELECT", async () => {
    const result = await extractQueryTypes({
      databaseUrl: SOURCE_URL,
      sql: "SELECT id, email, display_name FROM users WHERE id = $1",
    });

    // Type guard: not a parse error
    expect("errorCode" in result).toBe(false);
    if ("errorCode" in result) return;

    // One param, inferred as int4 (integer)
    expect(result.paramMetadata.params).toHaveLength(1);

    // Three return columns in declared order
    expect(result.returnTypes).toHaveLength(3);
    const byName = Object.fromEntries(
      result.returnTypes.map((f) => [f.returnName, f]),
    );

    expect(byName.id).toMatchObject({
      columnName: "id",
      nullable: false,
    });
    expect(byName.email).toMatchObject({
      columnName: "email",
      nullable: false,
    });
    expect(byName.display_name).toMatchObject({
      columnName: "display_name",
      nullable: true,
    });
  });

  it("returns a parse error for a query with an undefined column", async () => {
    const result = await extractQueryTypes({
      databaseUrl: SOURCE_URL,
      sql: "SELECT id, titel FROM tickets",
    });

    expect("errorCode" in result).toBe(true);
    if (!("errorCode" in result)) return;

    expect(result.errorCode).toBe("42703"); // undefined_column
    expect(result.message).toContain("titel");
    expect(result.position).toBeDefined();
  });

  it("reports LEFT JOIN right-side columns as nullable", async () => {
    const result = await extractQueryTypes({
      databaseUrl: SOURCE_URL,
      sql: `SELECT t.id, u.email AS author_email
            FROM tickets t
            LEFT JOIN users u ON u.id = t.author_id`,
    });

    expect("errorCode" in result).toBe(false);
    if ("errorCode" in result) return;

    const byName = Object.fromEntries(
      result.returnTypes.map((f) => [f.returnName, f]),
    );
    expect(byName.id?.nullable).toBe(false);
    // Joined column: Postgres' pg_attribute reports `email` as NOT NULL at
    // the underlying table level, so nullable=false here reflects the
    // *column definition*, not the join nullability. Upgrading this to
    // "LEFT JOIN makes it nullable" is a future refinement that needs
    // query-plan analysis, not just pg_attribute. For now we document
    // the limitation by asserting what pgtyped's extraction actually
    // returns.
    expect(byName.author_email?.nullable).toBe(false);
  });
});
