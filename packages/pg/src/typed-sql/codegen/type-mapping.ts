/**
 * Map a pgtyped `MappableType` (either a Postgres type name like `"int4"` or
 * a structured type like an enum) into a TypeScript type expression string.
 *
 * The mapping table is intentionally minimal — we cover the common Postgres
 * types that realistic application queries use. Unknown types fall back to
 * `unknown`. Adding a type is one line.
 *
 * Array handling: Postgres array type names are prefixed with `_`
 * (e.g. `int4[]` is `_int4` in `pg_type.typname`). We recurse on the
 * element type for these.
 */

import type { MappableType } from "../query/type.js";
import { isEnum, isEnumArray } from "../query/type.js";

/**
 * Base Postgres type name → TypeScript type expression.
 *
 * Notes on a few non-obvious choices:
 *
 * - `int8` → `string`: `pg` returns bigint columns as strings by default
 *   to preserve precision. Users who reconfigure `pg.types.setTypeParser`
 *   can cast at the call site.
 * - `numeric` → `string`: same reason — `pg` returns `numeric` as string.
 * - `json` / `jsonb` → `unknown`: the dev must narrow via an `@json`
 *   annotation (see preprocess/json-annotations.ts). Defaulting to
 *   `unknown` (not `any`) keeps the type honest at the boundary.
 * - `date` / `time` / `timetz` → `string`: `pg` returns them as strings.
 *   Only `timestamp` / `timestamptz` come back as `Date`.
 */
export const BASE_TYPE_MAP: Record<string, string> = {
  bool: "boolean",
  int2: "number",
  int4: "number",
  int8: "string",
  float4: "number",
  float8: "number",
  numeric: "string",
  money: "string",
  text: "string",
  varchar: "string",
  char: "string",
  bpchar: "string",
  name: "string",
  bytea: "Buffer",
  date: "string",
  time: "string",
  timetz: "string",
  timestamp: "Date",
  timestamptz: "Date",
  interval: "string",
  uuid: "string",
  json: "unknown",
  jsonb: "unknown",
  inet: "string",
  cidr: "string",
  macaddr: "string",
  oid: "number",
  void: "void",
};

export function mapPgTypeNameToTs(name: string): string {
  if (name.startsWith("_")) {
    return `${mapPgTypeNameToTs(name.slice(1))}[]`;
  }
  return BASE_TYPE_MAP[name] ?? "unknown";
}

export function mapMappableTypeToTs(type: MappableType): string {
  if (typeof type === "string") {
    return mapPgTypeNameToTs(type);
  }
  if (isEnumArray(type)) {
    const union = type.elementType.enumValues
      .map((v) => JSON.stringify(v))
      .join(" | ");
    return `(${union})[]`;
  }
  if (isEnum(type)) {
    return type.enumValues.map((v) => JSON.stringify(v)).join(" | ");
  }
  // NamedType / AliasedType / ImportedType — we don't currently resolve
  // these because pgtyped's extraction doesn't populate them for the
  // common Postgres type catalog. Fall back to unknown.
  return "unknown";
}

/**
 * Wrap a TS type string with `| null` if the column/param is nullable.
 * Idempotent — if the type already contains ` | null`, leaves it alone.
 */
export function wrapNullable(tsType: string, nullable: boolean): string {
  if (!nullable) return tsType;
  if (/\|\s*null\b/.test(tsType)) return tsType;
  return `${tsType} | null`;
}
