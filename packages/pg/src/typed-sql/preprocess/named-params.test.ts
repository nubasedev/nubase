import { describe, expect, it } from "vitest";
import { preprocessNamedParams } from "./named-params";

describe("preprocessNamedParams", () => {
  it("leaves a parameter-free query unchanged", () => {
    const result = preprocessNamedParams("SELECT 1");
    expect(result.sql).toBe("SELECT 1");
    expect(result.params).toEqual([]);
    expect(result.rewrites).toEqual([]);
  });

  it("rewrites a single named param to $1", () => {
    const result = preprocessNamedParams("SELECT * FROM t WHERE id = :id");
    expect(result.sql).toBe("SELECT * FROM t WHERE id = $1");
    expect(result.params).toEqual(["id"]);
    expect(result.rewrites).toHaveLength(1);
    expect(result.rewrites[0]).toMatchObject({
      paramName: "id",
      replacement: "$1",
      originalStart: 27,
      originalEnd: 30,
    });
  });

  it("assigns $1, $2, ... in first-appearance order", () => {
    const result = preprocessNamedParams(
      "SELECT * FROM t WHERE a = :first AND b = :second",
    );
    expect(result.sql).toBe("SELECT * FROM t WHERE a = $1 AND b = $2");
    expect(result.params).toEqual(["first", "second"]);
  });

  it("collapses duplicate param names to the same $N", () => {
    const result = preprocessNamedParams(
      "SELECT * FROM t WHERE a = :x OR b = :x",
    );
    expect(result.sql).toBe("SELECT * FROM t WHERE a = $1 OR b = $1");
    expect(result.params).toEqual(["x"]);
    expect(result.rewrites).toHaveLength(2);
    expect(result.rewrites[0]?.replacement).toBe("$1");
    expect(result.rewrites[1]?.replacement).toBe("$1");
  });

  it("does not rewrite :: type casts", () => {
    const result = preprocessNamedParams("SELECT '1'::int AS n");
    expect(result.sql).toBe("SELECT '1'::int AS n");
    expect(result.params).toEqual([]);
  });

  it("ignores named params inside single-quoted strings", () => {
    const result = preprocessNamedParams(
      "SELECT ':not_a_param' WHERE id = :id",
    );
    expect(result.sql).toBe("SELECT ':not_a_param' WHERE id = $1");
    expect(result.params).toEqual(["id"]);
  });

  it("handles escaped quotes inside single-quoted strings", () => {
    const result = preprocessNamedParams(
      "SELECT 'it''s fine :notparam' WHERE x = :real",
    );
    expect(result.sql).toBe("SELECT 'it''s fine :notparam' WHERE x = $1");
    expect(result.params).toEqual(["real"]);
  });

  it("ignores named params inside double-quoted identifiers", () => {
    const result = preprocessNamedParams(
      'SELECT "col:with:colons" FROM t WHERE id = :id',
    );
    expect(result.sql).toBe('SELECT "col:with:colons" FROM t WHERE id = $1');
    expect(result.params).toEqual(["id"]);
  });

  it("ignores named params inside line comments", () => {
    const source = "-- :not a param\nSELECT :real FROM t";
    const result = preprocessNamedParams(source);
    expect(result.sql).toBe("-- :not a param\nSELECT $1 FROM t");
    expect(result.params).toEqual(["real"]);
  });

  it("ignores named params inside block comments", () => {
    const source = "SELECT /* :not :real :any */ :x FROM t";
    const result = preprocessNamedParams(source);
    expect(result.sql).toBe("SELECT /* :not :real :any */ $1 FROM t");
    expect(result.params).toEqual(["x"]);
  });

  it("ignores named params inside dollar-quoted strings (no tag)", () => {
    const source = "SELECT $$:not :any :param$$ WHERE id = :id";
    const result = preprocessNamedParams(source);
    expect(result.sql).toBe("SELECT $$:not :any :param$$ WHERE id = $1");
    expect(result.params).toEqual(["id"]);
  });

  it("ignores named params inside dollar-quoted strings with tag", () => {
    const source = "SELECT $body$:not :param$body$ WHERE id = :id";
    const result = preprocessNamedParams(source);
    expect(result.sql).toBe("SELECT $body$:not :param$body$ WHERE id = $1");
    expect(result.params).toEqual(["id"]);
  });

  it("passes through native $1 placeholders unchanged", () => {
    const result = preprocessNamedParams("SELECT * FROM t WHERE id = $1");
    expect(result.sql).toBe("SELECT * FROM t WHERE id = $1");
    expect(result.params).toEqual([]);
  });

  it("rewrites multi-character param names", () => {
    const result = preprocessNamedParams(
      "SELECT * FROM t WHERE author_id = :authorId",
    );
    expect(result.sql).toBe("SELECT * FROM t WHERE author_id = $1");
    expect(result.params).toEqual(["authorId"]);
  });

  it("rewrites param names containing underscores and digits", () => {
    const result = preprocessNamedParams(
      "SELECT * FROM t WHERE x = :user_id AND y = :page2",
    );
    expect(result.sql).toBe("SELECT * FROM t WHERE x = $1 AND y = $2");
    expect(result.params).toEqual(["user_id", "page2"]);
  });

  it("rewrites params inside complex multi-line queries", () => {
    const source = `SELECT id, title
FROM tickets
WHERE status = :status
  AND author_id = :authorId
ORDER BY id
LIMIT :limit`;
    const result = preprocessNamedParams(source);
    expect(result.params).toEqual(["status", "authorId", "limit"]);
    expect(result.sql).toContain("WHERE status = $1");
    expect(result.sql).toContain("AND author_id = $2");
    expect(result.sql).toContain("LIMIT $3");
  });

  it("records rewrite spans pointing to the leading colon in the source", () => {
    const source = "SELECT :x";
    const result = preprocessNamedParams(source);
    const r = result.rewrites[0];
    expect(r).toBeDefined();
    expect(source.slice(r?.originalStart, r?.originalEnd)).toBe(":x");
  });
});
