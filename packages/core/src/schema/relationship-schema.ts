import { z } from "zod";
import {
  BaseSchema,
  type Infer,
  type ObjectSchema,
  OptionalSchema,
} from "./schema";

/**
 * Configuration for a 1×N relationship field on an ObjectSchema. Declares
 * which target-resource search view should be embedded for this relation,
 * and how to derive that view's params from the parent record.
 *
 * The relation reuses the target view's machinery wholesale: its
 * `schemaParams`, `onLoad`, `tableActions`, `rowActions`, filter bar — all
 * already declared on the target resource. The parent's only job is to
 * (a) name the view and (b) compute its params from the parent record.
 *
 * @example
 * ```ts
 * import { ticketResource } from "./ticket";
 *
 * tickets: nu.relation({
 *   view: ticketResource.views.userTicketsSearch,
 *   paramsFrom: (parent) => ({ userId: parent.id }),
 *   label: "Tickets",
 * })
 * ```
 */
export interface RelationshipConfig<TView = unknown, TParent = any> {
  /**
   * The target resource's search view to embed. Pass the view by value
   * reference (e.g. `ticketResource.views.userTicketsSearch`) so
   * TypeScript can structurally infer the view's params shape and check
   * `paramsFrom`'s return type.
   */
  view: TView;
  /**
   * Derive the embedded view's params from the parent record. Return
   * value must satisfy the view's `schemaParams` shape.
   */
  paramsFrom: (parent: TParent) => ParamsOf<TView>;
  /** Field label, rendered by FormControl in the shared label column. */
  label?: string;
}

/**
 * Structural extraction of the params shape from a view value. If the view
 * declares `schemaParams: ObjectSchema<...>`, we infer its output type;
 * otherwise we fall back to a loose record.
 */
export type ParamsOf<TView> = TView extends { schemaParams?: infer P }
  ? P extends ObjectSchema<any>
    ? Infer<P>
    : Record<string, any>
  : Record<string, any>;

/**
 * Virtual schema that marks a shape entry as a 1×N relationship. Its
 * runtime value is always undefined — the embedded view fetches its own
 * data using params derived from the parent.
 */
export class RelationshipSchema<
  TView = unknown,
  TParent = any,
> extends BaseSchema<undefined> {
  readonly type = "relationship" as const;

  readonly _view: TView;
  readonly _paramsFrom: (parent: TParent) => ParamsOf<TView>;

  constructor(config: RelationshipConfig<TView, TParent>) {
    super();
    this._view = config.view;
    this._paramsFrom = config.paramsFrom;
    if (config.label !== undefined) {
      this._meta = { ...this._meta, label: config.label };
    }
  }

  toZod(): z.ZodSchema<undefined> {
    return z.any().optional() as unknown as z.ZodSchema<undefined>;
  }
}

/**
 * Creates a 1×N relationship field. The returned schema is wrapped in an
 * `OptionalSchema` so the field appears as an optional key on the parent's
 * `ObjectOutput`.
 */
export const createRelationship = <TView, TParent = any>(
  config: RelationshipConfig<TView, TParent>,
): OptionalSchema<RelationshipSchema<TView, TParent>> =>
  new OptionalSchema(new RelationshipSchema(config));
