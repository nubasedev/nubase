import type { ArraySchema, Infer, ObjectSchema } from "@nubase/core";
import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";
import type { ActionLayout } from "./action-layout";
import type { BreadcrumbDefinition } from "./breadcrumb";

export type ViewType = "object";

export type ViewBase<
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
  TData = any,
> = {
  title: string;
  id: string;
  /**
   * Optional breadcrumb navigation trail for this view.
   */
  breadcrumbs?: BreadcrumbDefinition<TApiEndpoints, TParamsSchema, TData>;
};

export type ResourceCreateView<
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
  TActionIds extends string = string,
> = ViewBase<TApiEndpoints, TParamsSchema> & {
  type: "resource-create";
  /**
   * Schema for the form data to be posted when creating a resource.
   */
  schemaPost: TSchema;
  /**
   * Optional schema for URL parameters this view expects.
   */
  schemaParams?: TParamsSchema;
  /**
   * Optional actions to display for this view (e.g., save, cancel, reset).
   */
  actions?: ActionLayout<TActionIds>;
  /**
   * Creates a new resource.
   */
  onSubmit: ({
    data,
    context,
  }: {
    data: Infer<TSchema>;
    context: NubaseContextData<TApiEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<any>>;
};

/**
 * Per-field handler for a virtual relationship field (declared on the
 * schema via `nu.relation(...)`). The schema declares *what* the
 * relationship is (target resource, row shape, label); this handler
 * declares *how* to fetch the related rows at runtime.
 *
 * Lives on the view rather than the schema because it needs `context.http`,
 * which is frontend-only — schemas live in `common/`.
 */
export type RelationshipFieldHandler<
  TParent = any,
  TApiEndpoints = any,
  TRow = any,
> = {
  /**
   * Loads the related rows for a remote relationship. Called whenever the
   * (debounced) `query` or `nql` changes.
   *
   * - `query` — the plain text typed in the simplified search input. Empty
   *   string when the user is in NQL mode.
   * - `nql` — the NQL expression typed in the NQL editor. Empty string
   *   when the user is in Search mode.
   *
   * Handlers typically forward `query` to the endpoint's text search field
   * (e.g. `title`) and `nql` to the standard `nql` parameter, leaving the
   * empty one undefined.
   */
  onSearch: (args: {
    parent: TParent;
    query: string;
    nql: string;
    context: NubaseContextData<TApiEndpoints>;
  }) => Promise<HttpResponse<TRow[]>>;
};

/**
 * Map of field-name → handler for virtual relationship fields on the view's
 * schema. Each key must match a field declared via `nu.relation(...)` in
 * the schema shape.
 */
export type FieldHandlers<TParent = any, TApiEndpoints = any> = Record<
  string,
  RelationshipFieldHandler<TParent, TApiEndpoints>
>;

export type ResourceViewView<
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
  TActionIds extends string = string,
> = ViewBase<TApiEndpoints, TParamsSchema, Infer<TSchema>> & {
  type: "resource-view";
  /**
   * Schema for the resource data retrieved from the server.
   */
  schemaGet: TSchema;
  /**
   * Optional schema for URL parameters this view expects.
   */
  schemaParams?: TParamsSchema;
  /**
   * Optional actions to display for this view (e.g., edit, delete, duplicate).
   */
  actions?: ActionLayout<TActionIds>;
  /**
   * Loads the resource data.
   */
  onLoad: ({
    context,
  }: {
    context: NubaseContextData<TApiEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<Infer<TSchema>>>;
  /**
   * Patches a resource with partial data.
   */
  onPatch: ({
    data,
    context,
  }: {
    data: Partial<Infer<TSchema>>;
    context: NubaseContextData<TApiEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<any>>;
  /**
   * Optional handlers for virtual relationship fields declared on the
   * schema via `nu.relation(...)`. Keyed by field name. Each handler
   * provides the runtime fetch logic for its field.
   */
  fieldHandlers?: FieldHandlers<Infer<TSchema>, TApiEndpoints>;
};

export type ResourceSearchView<
  TSchema extends ArraySchema<any> = ArraySchema<any>,
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
  TActionIds extends string = string,
  TFilterSchema extends ObjectSchema<any> | undefined = undefined,
  TPatchSchema extends ObjectSchema<any> | undefined = undefined,
> = ViewBase<TApiEndpoints, TParamsSchema> & {
  type: "resource-search";
  /**
   * Schema for the search results data retrieved from the server.
   */
  schemaGet: TSchema;
  /**
   * Optional schema for URL parameters this view expects.
   */
  schemaParams?: TParamsSchema;
  /**
   * Optional schema for filter parameters (typically endpoint.requestParams).
   * When provided, a filter bar will be automatically generated.
   */
  schemaFilter?: TFilterSchema;
  /**
   * Optional schema for patchable fields in inline editing.
   * Only fields present in this schema will be editable in the table.
   * Typically this is the requestBody schema of the patch endpoint.
   */
  schemaPatch?: TPatchSchema;
  /**
   * Optional actions to display above the table for bulk operations on selected items.
   */
  tableActions?: ActionLayout<TActionIds>;
  /**
   * Optional actions to display in the dropdown for each row.
   */
  rowActions?: ActionLayout<TActionIds>;
  /**
   * Loads the search results data.
   */
  onLoad: ({
    context,
  }: {
    context: NubaseContextData<TApiEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<Infer<TSchema>>>;
  /**
   * Optional handler for inline patching of individual fields.
   * Required when schemaPatch is provided and tableLayout.metadata.patchable is true.
   */
  onPatch?: ({
    id,
    fieldName,
    value,
    context,
  }: {
    id: string | number;
    fieldName: string;
    value: any;
    context: NubaseContextData<TApiEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<any>>;
};

export type View<
  TSchema extends ObjectSchema<any> | ArraySchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
  TActionIds extends string = string,
  TFilterSchema extends ObjectSchema<any> | undefined = undefined,
  TPatchSchema extends ObjectSchema<any> | undefined = undefined,
> =
  | ResourceCreateView<
      TSchema extends ObjectSchema<any> ? TSchema : ObjectSchema<any>,
      TApiEndpoints,
      TParamsSchema,
      TActionIds
    >
  | ResourceViewView<
      TSchema extends ObjectSchema<any> ? TSchema : ObjectSchema<any>,
      TApiEndpoints,
      TParamsSchema,
      TActionIds
    >
  | ResourceSearchView<
      TSchema extends ArraySchema<any> ? TSchema : ArraySchema<any>,
      TApiEndpoints,
      TParamsSchema,
      TActionIds,
      TFilterSchema,
      TPatchSchema
    >;
