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
  /** How related rows are loaded. `"searchable"` means lazy-fetch via onSearch. */
  mode?: "searchable";
  /** The id of the resource each row points to (for row-click navigation). */
  targetResourceId: string;
  /** Row-shape schema. Columns derive from its `default`/`table` layout. */
  schema: TTargetSchema;
  /** Section heading shown above the table. */
  label?: string;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
}

/**
 * Virtual schema that marks a shape entry as a 1×N relationship. Not real
 * data on the parent record — the runtime value is always undefined; rows
 * are fetched on demand by the relationship renderer.
 *
 * Wrapped in `OptionalSchema` by `nu.relation()` so it's absent from the
 * parent payload's required keys.
 */
export class RelationshipSchema<
  TTargetSchema extends ObjectSchema<any> = ObjectSchema<any>,
> extends BaseSchema<undefined> {
  readonly type = "relationship" as const;

  readonly _targetResourceId: string;
  readonly _targetSchema: TTargetSchema;
  readonly _mode: "searchable";
  readonly _relationshipLabel: string | undefined;
  readonly _searchPlaceholder: string | undefined;

  constructor(config: RelationshipConfig<TTargetSchema>) {
    super();
    this._targetResourceId = config.targetResourceId;
    this._targetSchema = config.schema;
    this._mode = config.mode ?? "searchable";
    this._relationshipLabel = config.label;
    this._searchPlaceholder = config.searchPlaceholder;
    if (config.label !== undefined) {
      this._meta = { ...this._meta, label: config.label };
    }
  }

  /**
   * Virtual fields don't appear in API payloads. We return a permissive
   * schema so `ObjectSchema.toZod()` over a shape containing a relationship
   * still validates real server responses (where the field is absent).
   */
  toZod(): z.ZodSchema<undefined> {
    return z.any().optional() as unknown as z.ZodSchema<undefined>;
  }
}

/**
 * Creates a 1×N relationship field. The returned schema is wrapped in an
 * `OptionalSchema` so the field appears as an optional key in
 * `ObjectOutput` (since the server doesn't send it).
 *
 * @example
 * ```ts
 * schemaGet: (api) => api.getUser.responseBody
 *   .extend({
 *     tickets: nu.relation({
 *       targetResourceId: "ticket",
 *       schema: userTicketSchema,
 *       label: "Tickets",
 *     }),
 *   })
 * ```
 */
export const createRelationship = <TTargetSchema extends ObjectSchema<any>>(
  config: RelationshipConfig<TTargetSchema>,
): OptionalSchema<RelationshipSchema<TTargetSchema>> =>
  new OptionalSchema(new RelationshipSchema(config));
