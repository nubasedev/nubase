import { describe, expect, it } from "vitest";
import { hoistImports } from "./hoist-imports";

describe("hoistImports", () => {
  it("returns empty imports when no import() types are present", () => {
    const { rewritten, importLines } = hoistImports([
      "number",
      "string | null",
      "{ foo: boolean }",
    ]);
    expect(rewritten).toEqual(["number", "string | null", "{ foo: boolean }"]);
    expect(importLines).toEqual([]);
  });

  it("hoists a single import type", () => {
    const { rewritten, importLines } = hoistImports([
      'import("@/schemas").TicketMetadata',
    ]);
    expect(rewritten).toEqual(["TicketMetadata"]);
    expect(importLines).toEqual([
      'import type { TicketMetadata } from "@/schemas";',
    ]);
  });

  it("hoists multiple imports from the same module", () => {
    const { rewritten, importLines } = hoistImports([
      'import("@/schemas").TicketMetadata',
      'import("@/schemas").UserPrefs',
    ]);
    expect(rewritten).toEqual(["TicketMetadata", "UserPrefs"]);
    expect(importLines).toEqual([
      'import type { TicketMetadata, UserPrefs } from "@/schemas";',
    ]);
  });

  it("hoists imports from multiple modules, sorted", () => {
    const { rewritten, importLines } = hoistImports([
      'import("@/a").X',
      'import("@/b").Y',
    ]);
    expect(rewritten).toEqual(["X", "Y"]);
    expect(importLines).toEqual([
      'import type { X } from "@/a";',
      'import type { Y } from "@/b";',
    ]);
  });

  it("dedupes repeated references to the same type", () => {
    const { rewritten, importLines } = hoistImports([
      'import("@/schemas").Foo',
      'import("@/schemas").Foo | null',
    ]);
    expect(rewritten).toEqual(["Foo", "Foo | null"]);
    expect(importLines).toEqual(['import type { Foo } from "@/schemas";']);
  });

  it("handles multiple imports in a single expression", () => {
    const { rewritten, importLines } = hoistImports([
      'import("@/a").X | import("@/b").Y',
    ]);
    expect(rewritten).toEqual(["X | Y"]);
    expect(importLines).toEqual([
      'import type { X } from "@/a";',
      'import type { Y } from "@/b";',
    ]);
  });

  it("aliases cross-module name collisions", () => {
    const { rewritten, importLines } = hoistImports([
      'import("@/a").Config',
      'import("@/b").Config',
    ]);
    // First module alphabetically gets the plain name.
    expect(importLines).toEqual([
      'import type { Config } from "@/a";',
      'import type { Config as Config_2 } from "@/b";',
    ]);
    expect(rewritten).toEqual(["Config", "Config_2"]);
  });

  it("accepts single-quoted import specifiers", () => {
    const { rewritten, importLines } = hoistImports([
      "import('@/schemas').Foo",
    ]);
    expect(rewritten).toEqual(["Foo"]);
    expect(importLines).toEqual(['import type { Foo } from "@/schemas";']);
  });

  it("preserves surrounding type syntax", () => {
    const { rewritten } = hoistImports([
      'Array<import("@/schemas").TicketMetadata>',
    ]);
    expect(rewritten).toEqual(["Array<TicketMetadata>"]);
  });
});
