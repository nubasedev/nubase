import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { extractSchemaFromClient } from "../extract/extract-schema";
import {
  createTestContext,
  destroyTestContext,
  resetDatabase,
  setupSchema,
  type TestContext,
} from "../testing/test-helpers";
import { diffSchemas } from "./diff-schemas";

describe("diffSchemas - integration", () => {
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

  it("should detect an added table", async () => {
    // target is empty, source has a table
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
      `,
    );

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);

    // diff from target → source (what do we need to do to target to make it match source?)
    const diff = diffSchemas(targetSchema, sourceSchema);

    expect(diff.hasDifferences).toBe(true);
    expect(Object.keys(diff.tables.added)).toContain("public.users");
    expect(Object.keys(diff.tables.removed)).toHaveLength(0);
  });

  it("should detect a removed table", async () => {
    // source is empty, target has a table
    await setupSchema(
      ctx.target,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
      `,
    );

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);

    // diff from target → source (target has table, source doesn't)
    const diff = diffSchemas(targetSchema, sourceSchema);

    expect(diff.hasDifferences).toBe(true);
    expect(Object.keys(diff.tables.removed)).toContain("public.users");
  });

  it("should detect a modified table (added column)", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT
      );
      `,
    );
    await setupSchema(
      ctx.target,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
      `,
    );

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);

    const diff = diffSchemas(targetSchema, sourceSchema);

    expect(diff.hasDifferences).toBe(true);
    const modified = diff.tables.modified["public.users"];
    expect(modified).toBeDefined();
    expect(Object.keys(modified.columns.added)).toContain("email");
  });

  it("should detect an added enum", async () => {
    await setupSchema(
      ctx.source,
      `CREATE TYPE status AS ENUM ('draft', 'active', 'archived');`,
    );

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);

    const diff = diffSchemas(targetSchema, sourceSchema);

    expect(diff.hasDifferences).toBe(true);
    expect(Object.keys(diff.enums.added)).toContain("public.status");
  });

  it("should detect no differences for identical schemas", async () => {
    const sql = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true
      );
    `;
    await setupSchema(ctx.source, sql);
    await setupSchema(ctx.target, sql);

    const sourceSchema = await extractSchemaFromClient(ctx.source);
    const targetSchema = await extractSchemaFromClient(ctx.target);

    const diff = diffSchemas(targetSchema, sourceSchema);

    expect(diff.hasDifferences).toBe(false);
  });
});
