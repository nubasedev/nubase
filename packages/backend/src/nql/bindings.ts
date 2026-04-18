import type { BaseSchema, ObjectSchema } from "@nubase/core";
import type { StringReference } from "kysely";

type ShapeOf = Record<string, BaseSchema<any>>;

/**
 * Runtime shape of an NQL field-to-column map. Keys are schema field names;
 * values are Kysely column references (e.g. `"tickets.title"`).
 *
 * This type is intentionally loose at runtime. The strong typing is applied
 * at binding-creation time via {@link createNqlBindings}, which constrains
 * keys to the schema's shape and values to the Kysely `StringReference`
 * union. Once built, the bindings object is carried through the NQL
 * pipeline as a plain `Record<string, string>`.
 */
export type FieldBindings = Record<string, string>;

/**
 * Curry a bindings factory for a specific Kysely DB type.
 *
 * The outer call pins `DB` (the generated Kysely database interface). The
 * inner call takes the NQL schema and a map whose keys are checked against
 * the schema's shape and whose values are checked against the Kysely
 * `StringReference<DB, TB>` union — so a typo in either half is a compile
 * error, and referencing a table you haven't joined in the current query
 * is caught when the resulting bindings are passed to `compileNql`.
 *
 * @example
 * ```ts
 * import type { DB } from "./db-types";
 * const ticketBindings = createNqlBindings<DB>()(ticketListSchema, {
 *   id: "tickets.id",
 *   title: "tickets.title",
 *   assigneeName: "users.displayName", // cross-table, only valid if joined
 * });
 * ```
 */
export function createNqlBindings<DB>() {
  return <TShape extends ShapeOf, TB extends keyof DB>(
    schema: ObjectSchema<TShape>,
    mapping: Partial<Record<keyof TShape & string, StringReference<DB, TB>>>,
  ): FieldBindings => {
    // Defensive runtime check: catches cases where the schema shape has
    // drifted (e.g. a field was `.omit()`ed) but the bindings weren't
    // updated. Throws at handler-module load time, not per request.
    for (const key of Object.keys(mapping)) {
      if (!(key in schema._shape)) {
        throw new Error(
          `createNqlBindings: field '${key}' is not in the schema shape`,
        );
      }
    }
    return mapping as FieldBindings;
  };
}
