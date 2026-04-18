import { nu } from "@nubase/core";
import { describe, expect, it } from "vitest";
import { parse } from "./parser";
import { tokenize } from "./tokenizer";
import type { ParsedNode } from "./types";
import { type ValidateOptions, validate } from "./validator";

const ticketSchema = nu.object({
  id: nu.number(),
  title: nu.string(),
  description: nu.string().optional(),
  assigneeId: nu.number().optional(),
  done: nu.boolean(),
});

function parseSource(source: string): ParsedNode {
  const toks = tokenize(source);
  if (!toks.ok) throw new Error(`tokenize failed: ${toks.error.message}`);
  const p = parse(toks.value);
  if (!p.ok) throw new Error(`parse failed: ${p.error.message}`);
  return p.value;
}

function run(source: string, opts: ValidateOptions = {}) {
  return validate(parseSource(source), ticketSchema, opts);
}

function expectError(source: string, messagePattern: RegExp) {
  const r = run(source);
  expect(r.ok).toBe(false);
  if (!r.ok) {
    expect(r.error.code).toBe("VALIDATE");
    expect(r.error.message).toMatch(messagePattern);
  }
  return r;
}

describe("validator - field resolution", () => {
  it("resolves field names case-insensitively and canonicalizes to the schema spelling", () => {
    const r = run('Title = "x"');
    expect(r.ok).toBe(true);
    if (r.ok && r.value.type === "comparison") {
      expect(r.value.field.name).toBe("title");
    }
  });

  it("rejects unknown fields", () => {
    expectError('nope = "x"', /Unknown field 'nope'/);
  });

  it("respects the allowFields whitelist", () => {
    const r = validate(parseSource('title = "x"'), ticketSchema, {
      allowFields: ["assigneeId"],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toMatch(/Unknown field 'title'/);

    const r2 = validate(parseSource("assigneeId = 1"), ticketSchema, {
      allowFields: ["assigneeId"],
    });
    expect(r2.ok).toBe(true);
  });
});

describe("validator - type rules", () => {
  it("accepts string operators on string fields", () => {
    expect(run('title = "x"').ok).toBe(true);
    expect(run('title CONTAINS "x"').ok).toBe(true);
    expect(run('title STARTS_WITH "x"').ok).toBe(true);
    expect(run('title ENDS_WITH "x"').ok).toBe(true);
    expect(run('title != "x"').ok).toBe(true);
  });

  it("rejects ordering operators on string fields", () => {
    expectError('title > "x"', /not supported on string/);
    expectError('title < "x"', /not supported on string/);
  });

  it("accepts comparison operators on number fields", () => {
    expect(run("id = 1").ok).toBe(true);
    expect(run("id != 1").ok).toBe(true);
    expect(run("id > 1").ok).toBe(true);
    expect(run("id >= 1").ok).toBe(true);
    expect(run("id < 1").ok).toBe(true);
    expect(run("id <= 1").ok).toBe(true);
  });

  it("rejects string operators on number fields", () => {
    expectError('id CONTAINS "1"', /not supported on number/);
  });

  it("accepts = and != on boolean fields", () => {
    expect(run("done = true").ok).toBe(true);
    expect(run("done != false").ok).toBe(true);
  });

  it("rejects ordering operators on boolean fields", () => {
    expectError("done < true", /not supported on boolean/);
  });

  it("rejects literal type mismatch", () => {
    expectError('id = "x"', /expects a number value/);
    expectError("title = 5", /expects a string value/);
    expectError("done = 1", /expects a boolean value/);
  });

  it("tells users to use IS NULL instead of = null", () => {
    expectError("description = null", /IS NULL/);
  });
});

describe("validator - null checks", () => {
  it("accepts IS NULL / IS NOT NULL on optional fields", () => {
    expect(run("description IS NULL").ok).toBe(true);
    expect(run("description IS NOT NULL").ok).toBe(true);
    expect(run("assigneeId IS NULL").ok).toBe(true);
  });

  it("rejects IS NULL on required fields", () => {
    expectError("title IS NULL", /required and cannot be null/);
    expectError("id IS NOT NULL", /required and cannot be null/);
  });
});

describe("validator - IN / NOT IN", () => {
  it("accepts IN with matching literal types", () => {
    expect(run("assigneeId IN (1, 2, 3)").ok).toBe(true);
    expect(run('title IN ("a", "b")').ok).toBe(true);
  });

  it("accepts NOT IN", () => {
    const r = run('title NOT IN ("a", "b")');
    expect(r.ok).toBe(true);
    if (r.ok && r.value.type === "in") {
      expect(r.value.negated).toBe(true);
    }
  });

  it("rejects IN list with wrong literal types", () => {
    expectError('assigneeId IN (1, "two", 3)', /expects a number value/);
  });

  it("rejects null inside IN list", () => {
    expectError("assigneeId IN (1, null)", /IS NULL/);
  });

  it("rejects IN on unknown field", () => {
    expectError("mystery IN (1)", /Unknown field 'mystery'/);
  });
});

describe("validator - logical combinations", () => {
  it("validates each child of AND/OR/NOT", () => {
    const r = run(
      '(title CONTAINS "x" OR title CONTAINS "y") AND description STARTS_WITH "z"',
    );
    expect(r.ok).toBe(true);
  });

  it("bubbles up errors from deeply nested branches", () => {
    expectError(
      '(title CONTAINS "x" OR nope = 1) AND done = true',
      /Unknown field 'nope'/,
    );
  });

  it("preserves logical structure and canonicalizes nested field names", () => {
    const r = run('TITLE = "x" AND Description IS NOT NULL');
    expect(r.ok).toBe(true);
    if (r.ok && r.value.type === "logical") {
      const [left, right] = r.value.children;
      expect(left).toMatchObject({
        type: "comparison",
        field: { name: "title", baseType: "string", optional: false },
      });
      expect(right).toMatchObject({
        type: "nullCheck",
        field: { name: "description", baseType: "string", optional: true },
      });
    }
  });
});

describe("validator - unsupported types", () => {
  it("rejects queries against non-queryable schema fields", () => {
    const schemaWithArray = nu.object({
      tags: nu.array(nu.string()),
      title: nu.string(),
    });
    const r = validate(parseSource('tags = "a"'), schemaWithArray);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toMatch(/not queryable/);
  });
});

describe("validator - error spans", () => {
  it("reports position for unknown field", () => {
    const r = run('nope = "x"');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.line).toBe(1);
      expect(r.error.column).toBe(1);
      expect(r.error.length).toBe(4);
    }
  });
});
