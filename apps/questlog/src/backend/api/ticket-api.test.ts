import { compileNql, createNqlBindings } from "@nubase/backend";
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import { describe, expect, it } from "vitest";
import { ticketListSchema } from "../../common/schema/ticket-schema";

/**
 * These tests pin the questlog ticket endpoint's NQL integration. They use
 * a DummyDriver Kysely so the query is compiled to SQL without a DB round
 * trip. The assertions confirm that NQL authored against `ticketListSchema`
 * resolves to the correct joined columns on both sides of the join.
 */

interface TestDB {
  tickets: {
    id: number;
    title: string;
    description: string | null;
    assigneeId: number | null;
    workspaceId: number;
  };
  users: {
    id: number;
    displayName: string | null;
    email: string;
  };
}

const db = new Kysely<TestDB>({
  dialect: {
    createAdapter: () => new PostgresAdapter(),
    createDriver: () => new DummyDriver(),
    createIntrospector: (d) => new PostgresIntrospector(d),
    createQueryCompiler: () => new PostgresQueryCompiler(),
  },
});

const bindings = createNqlBindings<TestDB>()(ticketListSchema, {
  id: "tickets.id",
  title: "tickets.title",
  description: "tickets.description",
  assigneeId: "tickets.assigneeId",
  assigneeName: "users.displayName",
  assigneeEmail: "users.email",
});

function baseQuery() {
  return db
    .selectFrom("tickets")
    .leftJoin("users", "tickets.assigneeId", "users.id")
    .select([
      "tickets.id",
      "tickets.title",
      "tickets.description",
      "tickets.assigneeId",
    ])
    .where("tickets.workspaceId", "=", 1);
}

describe("ticket endpoint - NQL integration", () => {
  it("compiles the canonical showcase query against ticketListSchema", () => {
    const result = compileNql(
      '(Title CONTAINS "override" OR Title CONTAINS "vulnerability") AND Description STARTS_WITH "Bibo"',
      ticketListSchema,
      { fields: bindings },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const { sql, parameters } = baseQuery().where(result.value).compile();
    expect(sql).toMatch(/"tickets"\."workspaceId" = \$1/);
    expect(sql).toMatch(/"tickets"\."title"[^"]+ilike \$2/is);
    expect(sql).toMatch(/"tickets"\."description"[^"]+ilike \$4/is);
    expect(parameters).toEqual([1, "%override%", "%vulnerability%", "Bibo%"]);
  });

  it("resolves cross-table fields through the bindings", () => {
    const result = compileNql(
      'assigneeName CONTAINS "alice" AND assigneeEmail ENDS_WITH "@nubase.dev"',
      ticketListSchema,
      { fields: bindings },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { sql, parameters } = baseQuery().where(result.value).compile();
    // NQL keys → Kysely refs on the joined users table.
    expect(sql).toMatch(/"users"\."displayName"[^"]+ilike \$2/is);
    expect(sql).toMatch(/"users"\."email"[^"]+ilike \$3/is);
    expect(parameters).toEqual([1, "%alice%", "%@nubase.dev"]);
  });

  it("allows IN on the optional assigneeId", () => {
    const result = compileNql("assigneeId IN (10, 20, 30)", ticketListSchema, {
      fields: bindings,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { parameters } = baseQuery().where(result.value).compile();
    expect(parameters).toEqual([1, 10, 20, 30]);
  });

  it("allows IS NULL on the optional description field", () => {
    const result = compileNql("description IS NULL", ticketListSchema, {
      fields: bindings,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { sql } = baseQuery().where(result.value).compile();
    expect(sql).toMatch(/"tickets"\."description" is null/i);
  });

  it("rejects unknown fields with a VALIDATE error", () => {
    const result = compileNql('mystery = "x"', ticketListSchema, {
      fields: bindings,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATE");
      expect(result.error.message).toMatch(/Unknown field 'mystery'/);
    }
  });

  it("rejects bad syntax with a PARSE error", () => {
    const result = compileNql("title =", ticketListSchema, {
      fields: bindings,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("PARSE");
  });

  it("rejects IS NULL on required fields", () => {
    const result = compileNql("title IS NULL", ticketListSchema, {
      fields: bindings,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATE");
      expect(result.error.message).toMatch(/required and cannot be null/);
    }
  });
});
