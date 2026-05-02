import { z } from "zod";
import { BaseSchema, type ObjectSchema, OptionalSchema } from "./schema";

/**
 * Configuration for a 1×N relationship field on an ObjectSchema.
 * Attached as a shape entry via `nu.relation()` — the field appears in
 * layouts just like any other field, but carries relationship metadata
 * instead of a primitive type.
 *
 * The `onSearch` handler is *not* declared on the schema — schemas live in
 * `common/` and cannot access the frontend HTTP client. The handler is
 * wired at the view level via `view.fieldHandlers[fieldName]`.
 */
export interface RelationshipConfig<
  TTargetSchema extends ObjectSchema<any> = ObjectSchema<any>,
> {
  /**
   * Where the related rows live.
   *
   * - `"remote"` (default): rows are fetched from a separate API via the
   *   view's `fieldHandlers[fieldName].onSearch`. The renderer drives a
   *   simplified Search/NQL bar against that handler.
   * - `"embedded"`: rows are part of the parent record's payload at
   *   `parent[fieldName]` — no API call. The renderer filters the
   *   embedded array client-side via a single search input.
   */
  source?: "remote" | "embedded";
  /** The id of the resource each row points to (for row-click navigation). */
  targetResourceId: string;
  /** Row-shape schema. Columns derive from its `default`/`table` layout. */
  schema: TTargetSchema;
  /** Field label, rendered by FormControl in the shared label column. */
  label?: string;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
}

/**
 * Virtual schema that marks a shape entry as a 1×N relationship.
 *
 * For `source: "remote"` the runtime value is always undefined — rows are
 * fetched on demand by the relationship renderer. For `source: "embedded"`
 * the runtime value is the array of related rows from the parent payload.
 *
 * Wrapped in `OptionalSchema` by `nu.relation()` so it's absent from the
 * parent payload's required keys in either case.
 */
export class RelationshipSchema<
  TTargetSchema extends ObjectSchema<any> = ObjectSchema<any>,
> extends BaseSchema<TTargetSchema["_outputType"][] | undefined> {
  readonly type = "relationship" as const;

  readonly _targetResourceId: string;
  readonly _targetSchema: TTargetSchema;
  readonly _source: "remote" | "embedded";
  readonly _searchPlaceholder: string | undefined;

  constructor(config: RelationshipConfig<TTargetSchema>) {
    super();
    this._targetResourceId = config.targetResourceId;
    this._targetSchema = config.schema;
    this._source = config.source ?? "remote";
    this._searchPlaceholder = config.searchPlaceholder;
    if (config.label !== undefined) {
      this._meta = { ...this._meta, label: config.label };
    }
  }

  /**
   * For embedded relationships the field is a real array on the parent
   * payload — validate it as such. For remote relationships the field is
   * absent from the payload, so any optional value validates.
   */
  toZod(): z.ZodSchema<TTargetSchema["_outputType"][] | undefined> {
    if (this._source === "embedded") {
      return z
        .array(this._targetSchema.toZod())
        .optional() as unknown as z.ZodSchema<
        TTargetSchema["_outputType"][] | undefined
      >;
    }
    return z.any().optional() as unknown as z.ZodSchema<
      TTargetSchema["_outputType"][] | undefined
    >;
  }
}

/**
 * Creates a 1×N relationship field. The returned schema is wrapped in an
 * `OptionalSchema` so the field appears as an optional key in
 * `ObjectOutput`.
 *
 * @example
 * ```ts
 * // Remote relation — rows fetched lazily via fieldHandlers.onSearch.
 * tickets: nu.relation({
 *   targetResourceId: "ticket",
 *   schema: userTicketSchema,
 *   label: "Tickets",
 * })
 *
 * // Embedded relation — rows live on the parent payload.
 * addresses: nu.relation({
 *   source: "embedded",
 *   targetResourceId: "address",
 *   schema: addressSchema,
 *   label: "Addresses",
 * })
 * ```
 */
export const createRelationship = <TTargetSchema extends ObjectSchema<any>>(
  config: RelationshipConfig<TTargetSchema>,
): OptionalSchema<RelationshipSchema<TTargetSchema>> =>
  new OptionalSchema(new RelationshipSchema(config));
