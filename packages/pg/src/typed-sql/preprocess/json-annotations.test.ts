import { describe, expect, it } from "vitest";
import { parseJsonAnnotations } from "./json-annotations";

describe("parseJsonAnnotations", () => {
  it("returns empty for a file with no annotations", () => {
    const result = parseJsonAnnotations("SELECT 1");
    expect(result.annotations).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it("parses a single annotation", () => {
    const source = `-- @json metadata: import("@/schemas").TicketMetadata
SELECT id, metadata FROM tickets`;
    const result = parseJsonAnnotations(source);
    expect(result.errors).toEqual([]);
    expect(result.annotations).toHaveLength(1);
    expect(result.annotations[0]).toMatchObject({
      name: "metadata",
      tsType: 'import("@/schemas").TicketMetadata',
      line: 1,
    });
  });

  it("parses multiple annotations", () => {
    const source = `-- @json metadata: import("@/schemas").TicketMetadata
-- @json tags: string[]
SELECT id, metadata, tags FROM tickets`;
    const result = parseJsonAnnotations(source);
    expect(result.errors).toEqual([]);
    expect(result.annotations).toHaveLength(2);
    expect(result.annotations[0]?.name).toBe("metadata");
    expect(result.annotations[1]?.name).toBe("tags");
    expect(result.annotations[1]?.line).toBe(2);
  });

  it("ignores blank lines in the header region", () => {
    const source = `-- @json a: string

-- @json b: number
SELECT *`;
    const result = parseJsonAnnotations(source);
    expect(result.annotations.map((a) => a.name)).toEqual(["a", "b"]);
  });

  it("ignores regular comments mixed with annotations", () => {
    const source = `-- this is a regular comment
-- @json metadata: import("@/schemas").Foo
-- another regular comment
-- @json tags: string[]
SELECT *`;
    const result = parseJsonAnnotations(source);
    expect(result.annotations.map((a) => a.name)).toEqual(["metadata", "tags"]);
  });

  it("stops scanning after the first non-comment line", () => {
    const source = `-- @json a: string
SELECT id, metadata
-- @json b: number`;
    const result = parseJsonAnnotations(source);
    expect(result.annotations.map((a) => a.name)).toEqual(["a"]);
  });

  it("accepts union types with `import(...)` syntax", () => {
    const source = `-- @json meta: import("@/schemas").Meta | null
SELECT *`;
    const result = parseJsonAnnotations(source);
    expect(result.annotations[0]?.tsType).toBe(
      'import("@/schemas").Meta | null',
    );
  });

  it("accepts inline object type literals", () => {
    const source = `-- @json prefs: { theme: "dark" | "light"; fontSize: number }
SELECT *`;
    const result = parseJsonAnnotations(source);
    expect(result.annotations[0]?.tsType).toBe(
      '{ theme: "dark" | "light"; fontSize: number }',
    );
  });

  it("reports a malformed annotation without crashing", () => {
    const source = `-- @json (invalid syntax)
SELECT *`;
    const result = parseJsonAnnotations(source);
    expect(result.annotations).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({
      code: "NU001",
      line: 1,
    });
  });

  it("reports a missing type after the colon", () => {
    const source = `-- @json foo:
SELECT *`;
    const result = parseJsonAnnotations(source);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.code).toBe("NU001");
  });

  it("reports duplicate annotations for the same name", () => {
    const source = `-- @json foo: string
-- @json foo: number
SELECT *`;
    const result = parseJsonAnnotations(source);
    expect(result.annotations).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.code).toBe("NU002");
    expect(result.errors[0]?.message).toContain("Duplicate");
  });

  it("records 1-based line and column for diagnostic output", () => {
    const source = `-- @json metadata: Foo
SELECT *`;
    const result = parseJsonAnnotations(source);
    expect(result.annotations[0]?.line).toBe(1);
    expect(result.annotations[0]?.column).toBe(4); // `@json` at column 4 after `-- `
  });
});
