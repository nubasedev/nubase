import { describe, expect, it } from "vitest";
import { preprocessNamedParams } from "../preprocess/named-params";
import { formatParseError } from "./parse-error";

describe("formatParseError", () => {
  it("formats a 42703 undefined_column error with context", () => {
    const source = `SELECT
  t.id,
  t.titel,
  t.status
FROM tickets t
WHERE t.id = 1`;
    const { rewrites } = preprocessNamedParams(source);

    // Postgres reports 1-based position; "titel" starts at 1-based offset 18.
    const badOffset = source.indexOf("titel") + 1;

    const out = formatParseError({
      filePath: "data-layer/tickets/listTickets.sql",
      source,
      rewrites,
      error: {
        errorCode: "42703",
        message: 'column "titel" does not exist',
        hint: 'Perhaps you meant to reference the column "tickets.title".',
        position: String(badOffset),
      },
    });

    expect(out).toContain("✖ data-layer/tickets/listTickets.sql");
    expect(out).toContain('42703: column "titel" does not exist');
    expect(out).toContain("t.titel");
    expect(out).toContain("^");
    expect(out).toContain("Hint: Perhaps you meant");
    expect(out).toContain("(undefined_column)");
  });

  it("includes the SQLSTATE name when known", () => {
    const out = formatParseError({
      filePath: "t.sql",
      source: "SELECT 1",
      rewrites: [],
      error: { errorCode: "42601", message: "syntax error" },
    });
    expect(out).toContain("(syntax_error)");
  });

  it("falls back to raw code when SQLSTATE is unknown", () => {
    const out = formatParseError({
      filePath: "t.sql",
      source: "SELECT 1",
      rewrites: [],
      error: { errorCode: "XX999", message: "custom" },
    });
    expect(out).toContain("Postgres error code XX999");
    expect(out).not.toContain("()");
  });

  it("omits the hint section when no hint is present", () => {
    const out = formatParseError({
      filePath: "t.sql",
      source: "SELECT 1",
      rewrites: [],
      error: { errorCode: "42601", message: "oops" },
    });
    expect(out).not.toContain("Hint:");
  });

  it("omits source context when position is missing", () => {
    const out = formatParseError({
      filePath: "t.sql",
      source: "SELECT 1",
      rewrites: [],
      error: { errorCode: "42601", message: "oops" },
    });
    expect(out).not.toContain("│");
  });

  it("translates position back through named-param rewrites", () => {
    const source = "SELECT :userId, bad FROM t";
    const { sql, rewrites } = preprocessNamedParams(source);
    const badInRewritten = sql.indexOf("bad") + 1; // 1-based
    const out = formatParseError({
      filePath: "t.sql",
      source,
      rewrites,
      error: {
        errorCode: "42703",
        message: 'column "bad" does not exist',
        position: String(badInRewritten),
      },
    });
    // The caret should line up under "bad" in the original source.
    const lines = out.split("\n");
    const sqlLineIdx = lines.findIndex((l) => l.includes("SELECT :userId"));
    expect(sqlLineIdx).toBeGreaterThanOrEqual(0);
    const caretLine = lines[sqlLineIdx + 1] ?? "";
    expect(caretLine).toContain("^");
    // Compare caret position to the "bad" column in the source.
    const caretCol = caretLine.indexOf("^");
    const gutterWidth = (lines[sqlLineIdx] ?? "").indexOf("│") + 2; // space after │
    const badCol = source.indexOf("bad");
    expect(caretCol - gutterWidth).toBe(badCol);
  });
});
