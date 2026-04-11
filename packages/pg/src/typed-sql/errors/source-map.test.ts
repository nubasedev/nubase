import { describe, expect, it } from "vitest";
import { preprocessNamedParams } from "../preprocess/named-params";
import { mapRewrittenPositionToSource } from "./source-map";

describe("mapRewrittenPositionToSource", () => {
  it("maps simple positions with no rewrites", () => {
    const source = "SELECT bad FROM t";
    const { rewrites } = preprocessNamedParams(source);
    expect(mapRewrittenPositionToSource(source, rewrites, 8)).toEqual({
      line: 1,
      column: 8,
      offset: 7,
    });
  });

  it("counts line and column past newlines", () => {
    const source = "SELECT 1,\n  bad\nFROM t";
    const { rewrites } = preprocessNamedParams(source);
    // The 'b' in 'bad' is at line 2, column 3, offset 12.
    const loc = mapRewrittenPositionToSource(source, rewrites, 13);
    expect(loc).toEqual({ line: 2, column: 3, offset: 12 });
  });

  it("adjusts for a single named-param rewrite before the error", () => {
    // Original: "SELECT x FROM t WHERE id = :userId AND bad"
    // Rewritten: "SELECT x FROM t WHERE id = $1 AND bad"
    //            0         1         2         3
    //            0123456789012345678901234567890123456789
    // `bad` in rewritten starts at offset 34. In original it starts at
    // offset 39. Delta: +5 (original is longer by 5 chars because
    // ":userId" is 7 chars and "$1" is 2 chars).
    const source = "SELECT x FROM t WHERE id = :userId AND bad";
    const { sql, rewrites } = preprocessNamedParams(source);
    expect(sql).toBe("SELECT x FROM t WHERE id = $1 AND bad");
    const badInRewritten = sql.indexOf("bad");
    const loc = mapRewrittenPositionToSource(
      source,
      rewrites,
      badInRewritten + 1, // pg is 1-based
    );
    expect(loc).not.toBeNull();
    expect(source.slice(loc?.offset, loc?.offset + 3)).toBe("bad");
  });

  it("handles multiple rewrites before the error position", () => {
    const source = "SELECT :a, :b, bad FROM t";
    const { sql, rewrites } = preprocessNamedParams(source);
    expect(sql).toBe("SELECT $1, $2, bad FROM t");
    const badInRewritten = sql.indexOf("bad");
    const loc = mapRewrittenPositionToSource(
      source,
      rewrites,
      badInRewritten + 1,
    );
    expect(loc).not.toBeNull();
    expect(source.slice(loc?.offset, loc?.offset + 3)).toBe("bad");
  });

  it("maps a position inside a replacement to the original :name start", () => {
    const source = "SELECT :foo FROM t";
    const { sql, rewrites } = preprocessNamedParams(source);
    // `$1` is at offset 7 in the rewritten string.
    // Asking about offset 8 (the '1' in '$1') should map back to offset 7
    // in the original (the ':' of ':foo').
    const loc = mapRewrittenPositionToSource(source, rewrites, 8); // 1-based
    expect(loc).not.toBeNull();
    expect(loc?.offset).toBe(7);
    expect(source.charAt(loc?.offset)).toBe(":");
  });

  it("returns null for out-of-range positions", () => {
    const source = "SELECT 1";
    const { rewrites } = preprocessNamedParams(source);
    expect(mapRewrittenPositionToSource(source, rewrites, 0)).toBeNull();
  });
});
