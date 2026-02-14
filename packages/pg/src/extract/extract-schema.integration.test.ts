import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createTestContext,
  destroyTestContext,
  resetDatabase,
  setupSchema,
  type TestContext,
} from "../testing/test-helpers";
import { extractSchemaFromClient } from "./extract-schema";

describe("extractSchema - integration", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(async () => {
    await destroyTestContext(ctx);
  });

  beforeEach(async () => {
    await resetDatabase(ctx.source);
  });

  it("should extract an empty schema", async () => {
    const schema = await extractSchemaFromClient(ctx.source);

    expect(schema.pgVersion).toBeDefined();
    expect(schema.databaseName).toBe("nubase_source");
    expect(schema.extractedAt).toBeDefined();
    expect(Object.keys(schema.tables)).toHaveLength(0);
    expect(Object.keys(schema.enums)).toHaveLength(0);
  });

  it("should extract a table with columns, primary key, and index", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name TEXT,
        age INTEGER DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_users_name ON users (name);
      `,
    );

    const schema = await extractSchemaFromClient(ctx.source);

    // Table exists
    const table = schema.tables["public.users"];
    expect(table).toBeDefined();
    expect(table.schema).toBe("public");
    expect(table.name).toBe("users");

    // Columns
    const cols = table.columns;
    expect(Object.keys(cols)).toHaveLength(6);

    expect(cols.id.dataType).toBe("integer");
    expect(cols.id.isNullable).toBe(false);
    expect(cols.id.defaultValue).toContain("nextval");

    expect(cols.email.dataType).toBe("character varying");
    expect(cols.email.isNullable).toBe(false);
    expect(cols.email.characterMaxLength).toBe(255);

    expect(cols.name.dataType).toBe("text");
    expect(cols.name.isNullable).toBe(true);

    expect(cols.age.dataType).toBe("integer");
    expect(cols.age.defaultValue).toBe("0");

    expect(cols.is_active.dataType).toBe("boolean");
    expect(cols.is_active.isNullable).toBe(false);
    expect(cols.is_active.defaultValue).toBe("true");

    expect(cols.created_at.dataType).toBe("timestamp with time zone");
    expect(cols.created_at.isNullable).toBe(false);
    expect(cols.created_at.defaultValue).toBe("now()");

    // Primary key constraint
    const constraints = Object.values(table.constraints);
    const pk = constraints.find((c) => c.type === "PRIMARY KEY");
    expect(pk).toBeDefined();
    expect(pk?.columns).toEqual(["id"]);

    // Unique constraint on email
    const unique = constraints.find((c) => c.type === "UNIQUE");
    expect(unique).toBeDefined();
    expect(unique?.columns).toEqual(["email"]);

    // Indexes (PK index + unique index + custom index)
    const indexes = Object.values(table.indexes);
    const nameIndex = indexes.find((i) => i.name === "idx_users_name");
    expect(nameIndex).toBeDefined();
    expect(nameIndex?.columns).toEqual(["name"]);
    expect(nameIndex?.isUnique).toBe(false);
    expect(nameIndex?.method).toBe("btree");
  });

  it("should extract foreign keys with ON DELETE/ON UPDATE", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE SET NULL
      );
      `,
    );

    const schema = await extractSchemaFromClient(ctx.source);
    const posts = schema.tables["public.posts"];
    expect(posts).toBeDefined();

    const constraints = Object.values(posts.constraints);
    const fk = constraints.find((c) => c.type === "FOREIGN KEY");
    expect(fk).toBeDefined();
    expect(fk?.columns).toEqual(["author_id"]);
    expect(fk?.referencedTable).toBe("public.users");
    expect(fk?.referencedColumns).toEqual(["id"]);
    expect(fk?.onDelete).toBe("CASCADE");
    expect(fk?.onUpdate).toBe("SET NULL");
  });

  it("should extract CHECK constraints", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL CHECK (length(title) > 0),
        price NUMERIC NOT NULL CHECK (price >= 0)
      );
      `,
    );

    const schema = await extractSchemaFromClient(ctx.source);
    const table = schema.tables["public.products"];
    expect(table).toBeDefined();

    const constraints = Object.values(table.constraints);
    const checks = constraints.filter((c) => c.type === "CHECK");
    expect(checks).toHaveLength(2);

    const titleCheck = checks.find((c) => c.checkExpression?.includes("title"));
    expect(titleCheck).toBeDefined();
    expect(titleCheck?.checkExpression).toContain("length");

    const priceCheck = checks.find((c) => c.checkExpression?.includes("price"));
    expect(priceCheck).toBeDefined();
    expect(priceCheck?.checkExpression).toContain("price");
  });

  it("should extract enums", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TYPE status AS ENUM ('draft', 'active', 'archived');
      COMMENT ON TYPE status IS 'Record status';
      `,
    );

    const schema = await extractSchemaFromClient(ctx.source);
    const enumType = schema.enums["public.status"];
    expect(enumType).toBeDefined();
    expect(enumType.schema).toBe("public");
    expect(enumType.name).toBe("status");
    expect(enumType.values).toEqual(["draft", "active", "archived"]);
    expect(enumType.comment).toBe("Record status");
  });

  it("should extract sequences (standalone and owned)", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE SEQUENCE custom_seq START 100 INCREMENT 5;
      CREATE TABLE items (
        id SERIAL PRIMARY KEY,
        name TEXT
      );
      `,
    );

    const schema = await extractSchemaFromClient(ctx.source);

    // Standalone sequence
    const customSeq = schema.sequences["public.custom_seq"];
    expect(customSeq).toBeDefined();
    expect(customSeq.startValue).toBe("100");
    expect(customSeq.increment).toBe("5");
    expect(customSeq.ownedBy).toBeNull();

    // Owned sequence (from SERIAL)
    const ownedSeq = schema.sequences["public.items_id_seq"];
    expect(ownedSeq).toBeDefined();
    expect(ownedSeq.ownedBy).toBe("public.items.id");
  });

  it("should extract views", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true
      );
      CREATE VIEW active_users AS SELECT id, name FROM users WHERE is_active = true;
      COMMENT ON VIEW active_users IS 'Only active users';
      `,
    );

    const schema = await extractSchemaFromClient(ctx.source);
    const view = schema.views["public.active_users"];
    expect(view).toBeDefined();
    expect(view.schema).toBe("public");
    expect(view.name).toBe("active_users");
    expect(view.definition).toContain("SELECT");
    expect(view.columns).toEqual(["id", "name"]);
    expect(view.comment).toBe("Only active users");
  });

  it("should extract materialized views", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true
      );
      CREATE MATERIALIZED VIEW active_users_mat AS SELECT id, name FROM users WHERE is_active = true;
      CREATE INDEX idx_active_users_mat_id ON active_users_mat (id);
      `,
    );

    const schema = await extractSchemaFromClient(ctx.source);
    const matView = schema.materializedViews["public.active_users_mat"];
    expect(matView).toBeDefined();
    expect(matView.definition).toContain("SELECT");
    expect(matView.columns).toEqual(["id", "name"]);

    const indexes = Object.values(matView.indexes);
    const idx = indexes.find((i) => i.name === "idx_active_users_mat_id");
    expect(idx).toBeDefined();
    expect(idx?.columns).toEqual(["id"]);
  });

  it("should extract functions", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE FUNCTION add_numbers(a INTEGER, b INTEGER) RETURNS INTEGER
      LANGUAGE sql IMMUTABLE
      AS $$ SELECT a + b $$;
      `,
    );

    const schema = await extractSchemaFromClient(ctx.source);
    const funcs = Object.values(schema.functions);
    const addFn = funcs.find((f) => f.name === "add_numbers");
    expect(addFn).toBeDefined();
    expect(addFn?.returnType).toBe("integer");
    expect(addFn?.language).toBe("sql");
    expect(addFn?.volatility).toBe("IMMUTABLE");
    expect(addFn?.isProcedure).toBe(false);
  });

  it("should extract triggers", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        updated_at TIMESTAMPTZ
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

    const schema = await extractSchemaFromClient(ctx.source);
    const triggers = Object.values(schema.triggers);
    const trg = triggers.find((t) => t.name === "trg_users_updated");
    expect(trg).toBeDefined();
    expect(trg?.tableName).toBe("users");
    expect(trg?.timing).toBe("BEFORE");
    expect(trg?.events).toContain("UPDATE");
    expect(trg?.functionName).toBe("set_updated_at");
    expect(trg?.level).toBe("ROW");
  });

  it("should extract identity columns", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE entities (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        code INTEGER GENERATED BY DEFAULT AS IDENTITY
      );
      `,
    );

    const schema = await extractSchemaFromClient(ctx.source);
    const table = schema.tables["public.entities"];
    expect(table).toBeDefined();

    expect(table.columns.id.isIdentity).toBe(true);
    expect(table.columns.id.identityGeneration).toBe("ALWAYS");

    expect(table.columns.code.isIdentity).toBe(true);
    expect(table.columns.code.identityGeneration).toBe("BY DEFAULT");
  });

  it("should extract extensions", async () => {
    await setupSchema(ctx.source, `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    const schema = await extractSchemaFromClient(ctx.source);
    const ext = schema.extensions.pgcrypto;
    expect(ext).toBeDefined();
    expect(ext.name).toBe("pgcrypto");
    expect(ext.schema).toBeDefined();
    expect(ext.version).toBeDefined();
  });

  it("should extract domains", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE DOMAIN positive_int AS INTEGER DEFAULT 0 CHECK (VALUE >= 0);
      `,
    );

    const schema = await extractSchemaFromClient(ctx.source);
    const domain = schema.domains["public.positive_int"];
    expect(domain).toBeDefined();
    expect(domain.dataType).toBe("integer");
    expect(domain.defaultValue).toBe("0");
    expect(domain.checkConstraints.length).toBeGreaterThanOrEqual(1);
    expect(domain.checkConstraints[0].expression).toContain(">= 0");
  });

  it("should extract partial and multi-column indexes", async () => {
    await setupSchema(
      ctx.source,
      `
      CREATE TABLE people (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true
      );
      CREATE INDEX idx_people_active ON people (id) WHERE is_active = true;
      CREATE INDEX idx_people_name ON people (last_name, first_name);
      `,
    );

    const schema = await extractSchemaFromClient(ctx.source);
    const table = schema.tables["public.people"];
    const indexes = Object.values(table.indexes);

    // Partial index
    const partialIdx = indexes.find((i) => i.name === "idx_people_active");
    expect(partialIdx).toBeDefined();
    expect(partialIdx?.whereClause).toContain("is_active");

    // Multi-column index (order matters)
    const multiIdx = indexes.find((i) => i.name === "idx_people_name");
    expect(multiIdx).toBeDefined();
    expect(multiIdx?.columns).toEqual(["last_name", "first_name"]);
  });
});
