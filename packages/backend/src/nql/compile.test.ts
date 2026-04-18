import { nu } from "@nubase/core";
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import { describe, expect, it } from "vitest";
import { compileNql } from "./compile";

interface TestDB {
  tickets: {
    id: number;
    title: string;
    description: string | null;
    assigneeId: number | null;
    done: boolean;
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

const ticketSchema = nu.object({
  id: nu.number(),
  title: nu.string(),
  description: nu.string().optional(),
  assigneeId: nu.number().optional(),
  done: nu.boolean(),
});

const FIELDS = {
  id: "tickets.id",
  title: "tickets.title",
  description: "tickets.description",
  assigneeId: "tickets.assigneeId",
  done: "tickets.done",
};

describe("compileNql - happy path", () => {
  it("compiles the canonical showcase query end-to-end", () => {
    const result = compileNql(
      '(Title CONTAINS "override" OR Title CONTAINS "vulnerability") AND Description STARTS_WITH "Bibo"',
      ticketSchema,
      { fields: FIELDS },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const compiled = db
      .selectFrom("tickets")
      .selectAll()
      .where(result.value)
      .compile();

    expect(compiled.parameters).toEqual([
      "%override%",
      "%vulnerability%",
      "Bibo%",
    ]);
    expect(compiled.sql).toMatch(/"tickets"\."title"[^"]+ilike \$1/is);
    expect(compiled.sql).toMatch(/"tickets"\."description"[^"]+ilike \$3/is);
  });

  it("only allows fields that appear in the bindings map", () => {
    const result = compileNql('title = "x"', ticketSchema, {
      fields: { assigneeId: "tickets.assigneeId" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATE");
      expect(result.error.message).toMatch(/Unknown field 'title'/);
    }
  });
});

describe("compileNql - error bubbling", () => {
  it("returns a TOKENIZE error for an unknown character", () => {
    const result = compileNql("title = ?", ticketSchema, { fields: FIELDS });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("TOKENIZE");
      expect(result.error.line).toBe(1);
      expect(result.error.column).toBe(9);
    }
  });

  it("returns a PARSE error for a missing literal", () => {
    const result = compileNql("title =", ticketSchema, { fields: FIELDS });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("PARSE");
  });

  it("returns a VALIDATE error for an unknown field", () => {
    const result = compileNql('nope = "x"', ticketSchema, { fields: FIELDS });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATE");
      expect(result.error.message).toMatch(/Unknown field 'nope'/);
    }
  });

  it("returns a VALIDATE error for a type mismatch", () => {
    const result = compileNql('id = "x"', ticketSchema, { fields: FIELDS });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("VALIDATE");
  });
});

describe("compileNql - purity", () => {
  it("produces identical SQL for the same input", () => {
    const runOnce = () => {
      const r = compileNql('title = "x" AND done = true', ticketSchema, {
        fields: FIELDS,
      });
      if (!r.ok) throw new Error("compile failed");
      return db.selectFrom("tickets").selectAll().where(r.value).compile();
    };
    const a = runOnce();
    const b = runOnce();
    expect(a.sql).toBe(b.sql);
    expect(a.parameters).toEqual(b.parameters);
  });
});
