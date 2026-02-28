import { describe, expect, it } from "vitest";
import {
  pgTypeToTs,
  singularize,
  toCamelCase,
  toPascalCase,
} from "./pg-to-ts.js";

describe("pgTypeToTs", () => {
  it("maps integer types to number", () => {
    expect(pgTypeToTs("int2", "smallint")).toBe("number");
    expect(pgTypeToTs("int4", "integer")).toBe("number");
    expect(pgTypeToTs("int8", "bigint")).toBe("number");
    expect(pgTypeToTs("float4", "real")).toBe("number");
    expect(pgTypeToTs("float8", "double precision")).toBe("number");
    expect(pgTypeToTs("numeric", "numeric")).toBe("number");
    expect(pgTypeToTs("serial", "integer")).toBe("number");
    expect(pgTypeToTs("bigserial", "bigint")).toBe("number");
    expect(pgTypeToTs("smallserial", "smallint")).toBe("number");
  });

  it("maps string types to string", () => {
    expect(pgTypeToTs("varchar", "character varying")).toBe("string");
    expect(pgTypeToTs("text", "text")).toBe("string");
    expect(pgTypeToTs("char", "character")).toBe("string");
    expect(pgTypeToTs("bpchar", "character")).toBe("string");
    expect(pgTypeToTs("name", "name")).toBe("string");
    expect(pgTypeToTs("citext", "USER-DEFINED")).toBe("string");
    expect(pgTypeToTs("uuid", "uuid")).toBe("string");
  });

  it("maps boolean to boolean", () => {
    expect(pgTypeToTs("bool", "boolean")).toBe("boolean");
  });

  it("maps date/time types to string", () => {
    expect(pgTypeToTs("timestamp", "timestamp without time zone")).toBe(
      "string",
    );
    expect(pgTypeToTs("timestamptz", "timestamp with time zone")).toBe(
      "string",
    );
    expect(pgTypeToTs("date", "date")).toBe("string");
    expect(pgTypeToTs("time", "time without time zone")).toBe("string");
    expect(pgTypeToTs("timetz", "time with time zone")).toBe("string");
    expect(pgTypeToTs("interval", "interval")).toBe("string");
  });

  it("maps JSON types to unknown", () => {
    expect(pgTypeToTs("json", "json")).toBe("unknown");
    expect(pgTypeToTs("jsonb", "jsonb")).toBe("unknown");
  });

  it("maps bytea to string", () => {
    expect(pgTypeToTs("bytea", "bytea")).toBe("string");
  });

  it("returns USER_DEFINED for user-defined types", () => {
    expect(pgTypeToTs("ticket_status", "USER-DEFINED")).toBe("USER_DEFINED");
  });

  it("returns unknown for unrecognized types", () => {
    expect(pgTypeToTs("something_weird", "OTHER")).toBe("unknown");
  });

  it("handles array types with underscore prefix", () => {
    expect(pgTypeToTs("_int4", "ARRAY")).toBe("number[]");
    expect(pgTypeToTs("_text", "ARRAY")).toBe("string[]");
    expect(pgTypeToTs("_bool", "ARRAY")).toBe("boolean[]");
    expect(pgTypeToTs("_timestamptz", "ARRAY")).toBe("string[]");
    expect(pgTypeToTs("_jsonb", "ARRAY")).toBe("unknown[]");
  });
});

describe("toPascalCase", () => {
  it("converts snake_case to PascalCase", () => {
    expect(toPascalCase("ticket")).toBe("Ticket");
    expect(toPascalCase("user_workspace")).toBe("UserWorkspace");
    expect(toPascalCase("app_deployment")).toBe("AppDeployment");
  });

  it("handles single word", () => {
    expect(toPascalCase("ticket")).toBe("Ticket");
  });

  it("handles already capitalized words", () => {
    expect(toPascalCase("USER_WORKSPACE")).toBe("UserWorkspace");
  });
});

describe("toCamelCase", () => {
  it("converts snake_case to camelCase", () => {
    expect(toCamelCase("ticket")).toBe("ticket");
    expect(toCamelCase("user_workspace")).toBe("userWorkspace");
    expect(toCamelCase("app_deployment")).toBe("appDeployment");
  });

  it("handles single word", () => {
    expect(toCamelCase("ticket")).toBe("ticket");
  });
});

describe("singularize", () => {
  it("removes trailing s", () => {
    expect(singularize("tickets")).toBe("ticket");
    expect(singularize("users")).toBe("user");
    expect(singularize("workspaces")).toBe("workspace");
  });

  it("handles -ies suffix", () => {
    expect(singularize("categories")).toBe("category");
    expect(singularize("companies")).toBe("company");
  });

  it("handles -ses suffix", () => {
    expect(singularize("statuses")).toBe("status");
    expect(singularize("processes")).toBe("process");
  });

  it("handles -xes suffix", () => {
    expect(singularize("boxes")).toBe("box");
    expect(singularize("indexes")).toBe("index");
  });

  it("handles -ches suffix", () => {
    expect(singularize("batches")).toBe("batch");
    expect(singularize("matches")).toBe("match");
  });

  it("handles -shes suffix", () => {
    expect(singularize("dishes")).toBe("dish");
    expect(singularize("crashes")).toBe("crash");
  });

  it("does not singularize words ending in ss", () => {
    expect(singularize("address")).toBe("address");
    expect(singularize("boss")).toBe("boss");
  });

  it("returns unchanged when already singular", () => {
    expect(singularize("ticket")).toBe("ticket");
    expect(singularize("user")).toBe("user");
  });
});
