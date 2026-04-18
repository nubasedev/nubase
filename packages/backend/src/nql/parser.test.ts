import { describe, expect, it } from "vitest";
import { parse } from "./parser";
import { tokenize } from "./tokenizer";
import type { ParsedNode } from "./types";

function parseOrThrow(source: string): ParsedNode {
  const toks = tokenize(source);
  if (!toks.ok) throw new Error(`tokenize failed: ${toks.error.message}`);
  const parsed = parse(toks.value);
  if (!parsed.ok) throw new Error(`parse failed: ${parsed.error.message}`);
  return parsed.value;
}

function parseForError(source: string) {
  const toks = tokenize(source);
  if (!toks.ok) return { kind: "tokenize" as const, error: toks.error };
  const parsed = parse(toks.value);
  if (parsed.ok) return { kind: "ok" as const, node: parsed.value };
  return { kind: "parse" as const, error: parsed.error };
}

describe("parser - comparisons", () => {
  it("parses a simple equality", () => {
    const node = parseOrThrow('title = "foo"');
    expect(node).toMatchObject({
      type: "comparison",
      field: { raw: "title" },
      op: "=",
      value: { kind: "string", value: "foo" },
    });
  });

  it("parses all comparison operators", () => {
    expect(parseOrThrow("a = 1")).toMatchObject({ op: "=" });
    expect(parseOrThrow("a != 1")).toMatchObject({ op: "!=" });
    expect(parseOrThrow("a < 1")).toMatchObject({ op: "<" });
    expect(parseOrThrow("a <= 1")).toMatchObject({ op: "<=" });
    expect(parseOrThrow("a > 1")).toMatchObject({ op: ">" });
    expect(parseOrThrow("a >= 1")).toMatchObject({ op: ">=" });
    expect(parseOrThrow('a CONTAINS "x"')).toMatchObject({ op: "CONTAINS" });
    expect(parseOrThrow('a STARTS_WITH "x"')).toMatchObject({
      op: "STARTS_WITH",
    });
    expect(parseOrThrow('a ENDS_WITH "x"')).toMatchObject({ op: "ENDS_WITH" });
  });

  it("parses boolean and null literals", () => {
    expect(parseOrThrow("done = true")).toMatchObject({
      value: { kind: "boolean", value: true },
    });
    expect(parseOrThrow("done = false")).toMatchObject({
      value: { kind: "boolean", value: false },
    });
    expect(parseOrThrow("x = null")).toMatchObject({
      value: { kind: "null" },
    });
  });

  it("parses negative number literals", () => {
    expect(parseOrThrow("score > -5")).toMatchObject({
      value: { kind: "number", value: -5 },
    });
  });
});

describe("parser - null checks", () => {
  it("parses IS NULL", () => {
    expect(parseOrThrow("description IS NULL")).toMatchObject({
      type: "nullCheck",
      field: { raw: "description" },
      negated: false,
    });
  });

  it("parses IS NOT NULL", () => {
    expect(parseOrThrow("description IS NOT NULL")).toMatchObject({
      type: "nullCheck",
      field: { raw: "description" },
      negated: true,
    });
  });

  it("is case-insensitive", () => {
    expect(parseOrThrow("x is null")).toMatchObject({ negated: false });
    expect(parseOrThrow("x Is Not Null")).toMatchObject({ negated: true });
  });
});

describe("parser - IN / NOT IN", () => {
  it("parses IN with a single value", () => {
    expect(parseOrThrow('status IN ("open")')).toMatchObject({
      type: "in",
      field: { raw: "status" },
      negated: false,
      values: [{ kind: "string", value: "open" }],
    });
  });

  it("parses IN with multiple values", () => {
    expect(parseOrThrow("assigneeId IN (1, 2, 3)")).toMatchObject({
      type: "in",
      field: { raw: "assigneeId" },
      negated: false,
      values: [
        { kind: "number", value: 1 },
        { kind: "number", value: 2 },
        { kind: "number", value: 3 },
      ],
    });
  });

  it("parses NOT IN", () => {
    expect(parseOrThrow('status NOT IN ("open", "closed")')).toMatchObject({
      type: "in",
      field: { raw: "status" },
      negated: true,
      values: [
        { kind: "string", value: "open" },
        { kind: "string", value: "closed" },
      ],
    });
  });

  it("is case-insensitive", () => {
    expect(parseOrThrow("status in (1)")).toMatchObject({ negated: false });
    expect(parseOrThrow("status Not In (1)")).toMatchObject({ negated: true });
  });

  it("combines with AND/OR", () => {
    const node = parseOrThrow('assigneeId IN (1, 2) AND status != "done"');
    expect(node).toMatchObject({
      type: "logical",
      op: "AND",
      children: [
        { type: "in", field: { raw: "assigneeId" } },
        { type: "comparison", field: { raw: "status" } },
      ],
    });
  });

  it("rejects an empty list", () => {
    const r = parseForError("status IN ()");
    expect(r.kind).toBe("parse");
    if (r.kind === "parse") {
      expect(r.error.message).toMatch(/empty/i);
    }
  });

  it("rejects missing closing paren in list", () => {
    const r = parseForError("status IN (1, 2");
    expect(r.kind).toBe("parse");
  });

  it("rejects NOT without IN", () => {
    const r = parseForError('status NOT "x"');
    expect(r.kind).toBe("parse");
    if (r.kind === "parse") {
      expect(r.error.message).toMatch(/IN/);
    }
  });

  it("rejects trailing comma", () => {
    const r = parseForError("status IN (1, 2,)");
    expect(r.kind).toBe("parse");
  });
});

describe("parser - logical operators and precedence", () => {
  it("parses AND", () => {
    expect(parseOrThrow("a = 1 AND b = 2")).toMatchObject({
      type: "logical",
      op: "AND",
      children: [
        { type: "comparison", field: { raw: "a" } },
        { type: "comparison", field: { raw: "b" } },
      ],
    });
  });

  it("parses OR", () => {
    expect(parseOrThrow("a = 1 OR b = 2")).toMatchObject({
      type: "logical",
      op: "OR",
    });
  });

  it("gives AND higher precedence than OR", () => {
    // a = 1 OR b = 2 AND c = 3  =>  a = 1 OR (b = 2 AND c = 3)
    const node = parseOrThrow("a = 1 OR b = 2 AND c = 3");
    expect(node).toMatchObject({
      type: "logical",
      op: "OR",
      children: [
        { type: "comparison", field: { raw: "a" } },
        {
          type: "logical",
          op: "AND",
          children: [
            { type: "comparison", field: { raw: "b" } },
            { type: "comparison", field: { raw: "c" } },
          ],
        },
      ],
    });
  });

  it("left-associates chains of the same operator", () => {
    // a = 1 AND b = 2 AND c = 3 => ((a AND b) AND c)
    const node = parseOrThrow("a = 1 AND b = 2 AND c = 3");
    expect(node).toMatchObject({
      type: "logical",
      op: "AND",
      children: [
        {
          type: "logical",
          op: "AND",
          children: [
            { type: "comparison", field: { raw: "a" } },
            { type: "comparison", field: { raw: "b" } },
          ],
        },
        { type: "comparison", field: { raw: "c" } },
      ],
    });
  });

  it("respects parentheses over precedence", () => {
    // (a = 1 OR b = 2) AND c = 3
    const node = parseOrThrow("(a = 1 OR b = 2) AND c = 3");
    expect(node).toMatchObject({
      type: "logical",
      op: "AND",
      children: [
        { type: "logical", op: "OR" },
        { type: "comparison", field: { raw: "c" } },
      ],
    });
  });

  it("parses NOT binding tighter than AND", () => {
    // NOT a = 1 AND b = 2 => (NOT (a = 1)) AND (b = 2)
    const node = parseOrThrow("NOT a = 1 AND b = 2");
    expect(node).toMatchObject({
      type: "logical",
      op: "AND",
      children: [
        {
          type: "logical",
          op: "NOT",
          children: [{ type: "comparison", field: { raw: "a" } }],
        },
        { type: "comparison", field: { raw: "b" } },
      ],
    });
  });

  it("allows chained NOT", () => {
    const node = parseOrThrow("NOT NOT a = 1");
    expect(node).toMatchObject({
      type: "logical",
      op: "NOT",
      children: [
        {
          type: "logical",
          op: "NOT",
          children: [{ type: "comparison", field: { raw: "a" } }],
        },
      ],
    });
  });
});

describe("parser - canonical example", () => {
  it("parses the NQL showcase query", () => {
    const source =
      '(Title CONTAINS "override" OR Title CONTAINS "vulnerability") AND Description STARTS_WITH "Bibo"';
    const node = parseOrThrow(source);
    expect(node).toMatchObject({
      type: "logical",
      op: "AND",
      children: [
        {
          type: "logical",
          op: "OR",
          children: [
            {
              type: "comparison",
              field: { raw: "Title" },
              op: "CONTAINS",
              value: { kind: "string", value: "override" },
            },
            {
              type: "comparison",
              field: { raw: "Title" },
              op: "CONTAINS",
              value: { kind: "string", value: "vulnerability" },
            },
          ],
        },
        {
          type: "comparison",
          field: { raw: "Description" },
          op: "STARTS_WITH",
          value: { kind: "string", value: "Bibo" },
        },
      ],
    });
  });
});

describe("parser - errors", () => {
  it("reports missing RHS after operator", () => {
    const r = parseForError("title =");
    expect(r.kind).toBe("parse");
    if (r.kind === "parse") {
      expect(r.error.code).toBe("PARSE");
      expect(r.error.message).toMatch(/literal/i);
    }
  });

  it("reports trailing AND without RHS", () => {
    const r = parseForError("a = 1 AND");
    expect(r.kind).toBe("parse");
    if (r.kind === "parse") {
      expect(r.error.code).toBe("PARSE");
    }
  });

  it("reports missing closing paren", () => {
    const r = parseForError("(a = 1");
    expect(r.kind).toBe("parse");
    if (r.kind === "parse") {
      expect(r.error.message).toMatch(/\)/);
    }
  });

  it("reports missing field name before operator", () => {
    const r = parseForError('= "foo"');
    expect(r.kind).toBe("parse");
    if (r.kind === "parse") {
      expect(r.error.message).toMatch(/field name/i);
    }
  });

  it("reports IS without NULL", () => {
    const r = parseForError("x IS 5");
    expect(r.kind).toBe("parse");
    if (r.kind === "parse") {
      expect(r.error.message).toMatch(/NULL/);
    }
  });

  it("reports unexpected extra tokens after a valid expression", () => {
    const r = parseForError("a = 1 b = 2");
    expect(r.kind).toBe("parse");
    if (r.kind === "parse") {
      expect(r.error.code).toBe("PARSE");
    }
  });

  it("carries line and column in parse errors", () => {
    const r = parseForError("a = 1\nAND");
    expect(r.kind).toBe("parse");
    if (r.kind === "parse") {
      expect(r.error.line).toBe(2);
      expect(r.error.column).toBeGreaterThan(0);
    }
  });
});

describe("parser - spans", () => {
  it("sets a span that covers the whole expression", () => {
    const node = parseOrThrow('Title CONTAINS "foo" AND x = 1');
    expect(node.span.offset).toBe(0);
    // length should cover through the final "1"
    expect(node.span.length).toBe('Title CONTAINS "foo" AND x = 1'.length);
  });

  it("null-check span covers field through NULL", () => {
    const node = parseOrThrow("description IS NOT NULL");
    expect(node.span.offset).toBe(0);
    expect(node.span.length).toBe("description IS NOT NULL".length);
  });
});
