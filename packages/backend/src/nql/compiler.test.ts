import { nu } from "@nubase/core";
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import { describe, expect, it } from "vitest";
import type { FieldBindings } from "./bindings";
import { compileToExpression } from "./compiler";
import { parse } from "./parser";
import { tokenize } from "./tokenizer";
import type { ValidNode } from "./types";
import { validate } from "./validator";

// Minimal DB type for the dummy Kysely used in tests.
interface TestDB {
  tickets: {
    id: number;
    title: string;
    description: string | null;
    assigneeId: number | null;
    done: boolean;
  };
}

const DEFAULT_BINDINGS: FieldBindings = {
  id: "tickets.id",
  title: "tickets.title",
  description: "tickets.description",
  assigneeId: "tickets.assigneeId",
  done: "tickets.done",
};

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

function buildValidNode(source: string): ValidNode {
  const toks = tokenize(source);
  if (!toks.ok) throw new Error(`tokenize: ${toks.error.message}`);
  const parsed = parse(toks.value);
  if (!parsed.ok) throw new Error(`parse: ${parsed.error.message}`);
  const validated = validate(parsed.value, ticketSchema);
  if (!validated.ok) throw new Error(`validate: ${validated.error.message}`);
  return validated.value;
}

function compileSql(
  source: string,
  bindings: FieldBindings = DEFAULT_BINDINGS,
) {
  const node = buildValidNode(source);
  const query = db
    .selectFrom("tickets")
    .selectAll()
    .where((eb) => compileToExpression(node, eb, { fields: bindings }));
  const compiled = query.compile();
  return { sql: compiled.sql, parameters: compiled.parameters };
}

describe("compiler - primitive comparisons", () => {
  it("compiles string = to ILIKE (case-insensitive)", () => {
    const { sql, parameters } = compileSql('title = "Foo"');
    expect(sql).toMatch(/"tickets"\."title" ilike \$1/i);
    expect(parameters).toEqual(["Foo"]);
  });

  it("compiles string != to NOT ILIKE", () => {
    const { sql, parameters } = compileSql('title != "Foo"');
    expect(sql).toMatch(/"tickets"\."title" not ilike \$1/i);
    expect(parameters).toEqual(["Foo"]);
  });

  it("compiles number equality with a plain =", () => {
    const { sql, parameters } = compileSql("id = 42");
    expect(sql).toMatch(/"tickets"\."id" = \$1/);
    expect(parameters).toEqual([42]);
  });

  it("compiles boolean equality", () => {
    const { sql, parameters } = compileSql("done = true");
    expect(sql).toMatch(/"tickets"\."done" = \$1/);
    expect(parameters).toEqual([true]);
  });

  it("compiles numeric ordering", () => {
    const cases: Array<[string, string, unknown]> = [
      ["id < 5", "<", 5],
      ["id <= 5", "<=", 5],
      ["id > 5", ">", 5],
      ["id >= 5", ">=", 5],
    ];
    for (const [src, op, param] of cases) {
      const { sql, parameters } = compileSql(src);
      expect(sql).toContain(`"tickets"."id" ${op} $1`);
      expect(parameters).toEqual([param]);
    }
  });
});

describe("compiler - text operators", () => {
  it("compiles CONTAINS with % wildcards", () => {
    const { sql, parameters } = compileSql('title CONTAINS "bug"');
    expect(sql).toMatch(/"tickets"\."title" ilike \$1/);
    expect(parameters).toEqual(["%bug%"]);
  });

  it("compiles STARTS_WITH", () => {
    const { parameters } = compileSql('title STARTS_WITH "Bibo"');
    expect(parameters).toEqual(["Bibo%"]);
  });

  it("compiles ENDS_WITH", () => {
    const { parameters } = compileSql('title ENDS_WITH "!"');
    expect(parameters).toEqual(["%!"]);
  });

  it("escapes % and _ in user literals", () => {
    const { parameters } = compileSql('title CONTAINS "50% off_today"');
    expect(parameters).toEqual(["%50\\% off\\_today%"]);
  });

  it("escapes backslashes in user literals", () => {
    // source `a\\b` → tokenizer decodes to `a\b` (one backslash) →
    // ILIKE escape doubles it back to `a\\b` (two backslashes).
    const { parameters } = compileSql('title CONTAINS "a\\\\b"');
    expect(parameters).toEqual(["%a\\\\b%"]);
  });
});

describe("compiler - null checks", () => {
  it("compiles IS NULL", () => {
    const { sql, parameters } = compileSql("description IS NULL");
    expect(sql).toMatch(/"tickets"\."description" is null/i);
    expect(parameters).toEqual([]);
  });

  it("compiles IS NOT NULL", () => {
    const { sql, parameters } = compileSql("description IS NOT NULL");
    expect(sql).toMatch(/"tickets"\."description" is not null/i);
    expect(parameters).toEqual([]);
  });
});

describe("compiler - IN / NOT IN", () => {
  it("compiles IN list", () => {
    const { sql, parameters } = compileSql("assigneeId IN (1, 2, 3)");
    expect(sql).toMatch(/"tickets"\."assigneeId" in \(\$1, \$2, \$3\)/);
    expect(parameters).toEqual([1, 2, 3]);
  });

  it("compiles NOT IN list", () => {
    const { sql, parameters } = compileSql('title NOT IN ("Open", "Closed")');
    expect(sql).toMatch(/"tickets"\."title" not in \(\$1, \$2\)/);
    expect(parameters).toEqual(["Open", "Closed"]);
  });
});

describe("compiler - logical combinators", () => {
  it("wraps AND", () => {
    const { sql, parameters } = compileSql('title = "x" AND done = true');
    expect(sql).toMatch(
      /"tickets"\."title" ilike \$1 and "tickets"\."done" = \$2/i,
    );
    expect(parameters).toEqual(["x", true]);
  });

  it("wraps OR", () => {
    const { sql } = compileSql('title = "x" OR title = "y"');
    expect(sql).toMatch(/ilike \$1 or "tickets"\."title" ilike \$2/i);
  });

  it("wraps NOT", () => {
    const { sql } = compileSql('NOT title = "x"');
    expect(sql).toMatch(/not "tickets"\."title" ilike \$1/i);
  });

  it("preserves grouping", () => {
    const { sql, parameters } = compileSql(
      '(title CONTAINS "a" OR title CONTAINS "b") AND description IS NOT NULL',
    );
    // canonical parameterized form: two ILIKE params then NULL check
    expect(parameters).toEqual(["%a%", "%b%"]);
    expect(sql).toMatch(
      /\(.*or.*\).*and "tickets"\."description" is not null/is,
    );
  });
});

describe("compiler - canonical example", () => {
  it("produces a single parameterized WHERE for the showcase query", () => {
    const { sql, parameters } = compileSql(
      '(Title CONTAINS "override" OR Title CONTAINS "vulnerability") AND Description STARTS_WITH "Bibo"',
    );
    expect(parameters).toEqual(["%override%", "%vulnerability%", "Bibo%"]);
    expect(sql).toMatch(
      /"tickets"\."title"[^"]+ilike \$1[^"]+or[^"]+"tickets"\."title"[^"]+ilike \$2/is,
    );
    expect(sql).toMatch(/"tickets"\."description"[^"]+ilike \$3/is);
  });
});

describe("compiler - bindings as column map", () => {
  it("routes each field through its binding", () => {
    const { sql } = compileSql("id = 1", {
      id: "alias.id_col",
    });
    expect(sql).toMatch(/"alias"\."id_col" = \$1/);
  });
});
