import { describe, expect, it } from "vitest";
import { tokenize } from "./tokenizer";
import type { Token, TokenKind } from "./types";

function kinds(source: string): TokenKind[] {
  const result = tokenize(source);
  if (!result.ok) throw new Error(`tokenize failed: ${result.error.message}`);
  return result.value.map((t) => t.kind);
}

function tokensOrThrow(source: string): Token[] {
  const result = tokenize(source);
  if (!result.ok) throw new Error(`tokenize failed: ${result.error.message}`);
  return result.value;
}

describe("tokenizer - single-character tokens", () => {
  it("tokenizes parentheses", () => {
    expect(kinds("()")).toEqual(["LParen", "RParen", "Eof"]);
  });

  it("tokenizes equality operators", () => {
    expect(kinds("= !=")).toEqual(["Eq", "NotEq", "Eof"]);
  });

  it("tokenizes comparison operators", () => {
    expect(kinds("< <= > >=")).toEqual(["Lt", "LtEq", "Gt", "GtEq", "Eof"]);
  });
});

describe("tokenizer - keywords", () => {
  it("tokenizes logical keywords case-insensitively", () => {
    expect(kinds("AND and And OR or NOT not")).toEqual([
      "And",
      "And",
      "And",
      "Or",
      "Or",
      "Not",
      "Not",
      "Eof",
    ]);
  });

  it("tokenizes IS, NULL, TRUE, FALSE", () => {
    expect(kinds("IS NULL TRUE FALSE is null true false")).toEqual([
      "Is",
      "Null",
      "True",
      "False",
      "Is",
      "Null",
      "True",
      "False",
      "Eof",
    ]);
  });

  it("tokenizes IN and comma", () => {
    expect(kinds("status IN (1, 2)")).toEqual([
      "Identifier",
      "In",
      "LParen",
      "Number",
      "Comma",
      "Number",
      "RParen",
      "Eof",
    ]);
    expect(kinds("in")).toEqual(["In", "Eof"]);
  });

  it("tokenizes CONTAINS, STARTS_WITH, ENDS_WITH", () => {
    expect(kinds("CONTAINS STARTS_WITH ENDS_WITH")).toEqual([
      "Contains",
      "StartsWith",
      "EndsWith",
      "Eof",
    ]);
    expect(kinds("contains starts_with ends_with")).toEqual([
      "Contains",
      "StartsWith",
      "EndsWith",
      "Eof",
    ]);
  });

  it("does not treat identifier substrings of keywords as keywords", () => {
    // 'android' starts with 'and' but is an identifier
    expect(kinds("android orange notable")).toEqual([
      "Identifier",
      "Identifier",
      "Identifier",
      "Eof",
    ]);
  });
});

describe("tokenizer - identifiers", () => {
  it("tokenizes camelCase identifiers", () => {
    const toks = tokensOrThrow("assigneeId Title description_1 _hidden");
    expect(toks.map((t) => t.kind)).toEqual([
      "Identifier",
      "Identifier",
      "Identifier",
      "Identifier",
      "Eof",
    ]);
    expect(toks.slice(0, 4).map((t) => t.text)).toEqual([
      "assigneeId",
      "Title",
      "description_1",
      "_hidden",
    ]);
  });
});

describe("tokenizer - numbers", () => {
  it("tokenizes positive integers", () => {
    const toks = tokensOrThrow("0 42 1000");
    expect(toks.slice(0, 3).map((t) => t.numberValue)).toEqual([0, 42, 1000]);
  });

  it("tokenizes decimals", () => {
    const toks = tokensOrThrow("3.14 0.5");
    expect(toks.slice(0, 2).map((t) => t.numberValue)).toEqual([3.14, 0.5]);
  });

  it("tokenizes negative numbers", () => {
    const toks = tokensOrThrow("-5 -3.14");
    expect(toks.slice(0, 2).map((t) => t.numberValue)).toEqual([-5, -3.14]);
  });

  it("rejects decimal without fractional digits", () => {
    const result = tokenize("3.");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("TOKENIZE");
    }
  });
});

describe("tokenizer - strings", () => {
  it("tokenizes simple string literals", () => {
    const toks = tokensOrThrow('"hello" "world"');
    expect(toks.slice(0, 2).map((t) => t.stringValue)).toEqual([
      "hello",
      "world",
    ]);
  });

  it("decodes escape sequences", () => {
    const toks = tokensOrThrow('"a\\"b" "c\\\\d"');
    expect(toks.slice(0, 2).map((t) => t.stringValue)).toEqual(['a"b', "c\\d"]);
  });

  it("rejects unterminated strings at end of input", () => {
    const result = tokenize('"no end');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/Unterminated/);
    }
  });

  it("rejects strings that cross newlines", () => {
    const result = tokenize('"line1\nline2"');
    expect(result.ok).toBe(false);
  });

  it("rejects invalid escape sequences", () => {
    const result = tokenize('"bad\\xescape"');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/Invalid escape/);
    }
  });
});

describe("tokenizer - position tracking", () => {
  it("reports 1-based line and column on errors", () => {
    const result = tokenize("Title = ?");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.line).toBe(1);
      expect(result.error.column).toBe(9);
      expect(result.error.message).toMatch(/Unexpected character/);
    }
  });

  it("tracks line breaks", () => {
    const result = tokenize("Title\n= ?");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.line).toBe(2);
      expect(result.error.column).toBe(3);
    }
  });

  it("assigns spans with correct offsets and lengths", () => {
    const toks = tokensOrThrow('Title = "hi"');
    expect(toks[0]).toMatchObject({
      kind: "Identifier",
      span: { offset: 0, length: 5, line: 1, column: 1 },
    });
    expect(toks[1]).toMatchObject({
      kind: "Eq",
      span: { offset: 6, length: 1, line: 1, column: 7 },
    });
    expect(toks[2]).toMatchObject({
      kind: "String",
      span: { offset: 8, length: 4, line: 1, column: 9 },
    });
  });
});

describe("tokenizer - full queries", () => {
  it("tokenizes the canonical example query", () => {
    const source =
      '(Title CONTAINS "override" OR Title CONTAINS "vulnerability") AND Description STARTS_WITH "Bibo"';
    expect(kinds(source)).toEqual([
      "LParen",
      "Identifier",
      "Contains",
      "String",
      "Or",
      "Identifier",
      "Contains",
      "String",
      "RParen",
      "And",
      "Identifier",
      "StartsWith",
      "String",
      "Eof",
    ]);
  });

  it("tokenizes IS NULL and IS NOT NULL as separate tokens (parser joins them)", () => {
    expect(kinds("x IS NULL")).toEqual(["Identifier", "Is", "Null", "Eof"]);
    expect(kinds("x IS NOT NULL")).toEqual([
      "Identifier",
      "Is",
      "Not",
      "Null",
      "Eof",
    ]);
  });

  it("handles empty input", () => {
    expect(kinds("")).toEqual(["Eof"]);
    expect(kinds("   \t\n  ")).toEqual(["Eof"]);
  });
});
