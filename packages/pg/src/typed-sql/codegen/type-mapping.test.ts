import { describe, expect, it } from "vitest";
import type { EnumArrayType, EnumType } from "../query/type";
import {
  mapMappableTypeToTs,
  mapPgTypeNameToTs,
  wrapNullable,
} from "./type-mapping";

describe("mapPgTypeNameToTs", () => {
  it("maps common Postgres types", () => {
    expect(mapPgTypeNameToTs("bool")).toBe("boolean");
    expect(mapPgTypeNameToTs("int4")).toBe("number");
    expect(mapPgTypeNameToTs("int8")).toBe("string");
    expect(mapPgTypeNameToTs("text")).toBe("string");
    expect(mapPgTypeNameToTs("varchar")).toBe("string");
    expect(mapPgTypeNameToTs("timestamptz")).toBe("Date");
    expect(mapPgTypeNameToTs("uuid")).toBe("string");
    expect(mapPgTypeNameToTs("jsonb")).toBe("unknown");
  });

  it("maps array types via underscore prefix", () => {
    expect(mapPgTypeNameToTs("_int4")).toBe("number[]");
    expect(mapPgTypeNameToTs("_text")).toBe("string[]");
    expect(mapPgTypeNameToTs("_timestamptz")).toBe("Date[]");
  });

  it("returns 'unknown' for unmapped types", () => {
    expect(mapPgTypeNameToTs("some_custom_type")).toBe("unknown");
  });
});

describe("mapMappableTypeToTs", () => {
  it("handles plain string type names", () => {
    expect(mapMappableTypeToTs("int4")).toBe("number");
    expect(mapMappableTypeToTs("text")).toBe("string");
  });

  it("expands enum types to a string literal union", () => {
    const enumType: EnumType = {
      name: "ticket_status",
      enumValues: ["open", "in_progress", "closed"],
    };
    expect(mapMappableTypeToTs(enumType)).toBe(
      '"open" | "in_progress" | "closed"',
    );
  });

  it("expands enum array types", () => {
    const enumArrayType: EnumArrayType = {
      name: "_ticket_status",
      elementType: {
        name: "ticket_status",
        enumValues: ["open", "closed"],
      },
    };
    expect(mapMappableTypeToTs(enumArrayType)).toBe('("open" | "closed")[]');
  });

  it("falls back to unknown for unrecognized structured types", () => {
    expect(mapMappableTypeToTs({ name: "custom" })).toBe("unknown");
  });
});

describe("wrapNullable", () => {
  it("returns the type unchanged when not nullable", () => {
    expect(wrapNullable("number", false)).toBe("number");
  });

  it("appends | null when nullable", () => {
    expect(wrapNullable("number", true)).toBe("number | null");
  });

  it("is idempotent — doesn't double-wrap", () => {
    expect(wrapNullable("number | null", true)).toBe("number | null");
  });
});
