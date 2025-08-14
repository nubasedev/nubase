import type { ArraySchema, Infer, ObjectSchema } from "@nubase/core";
import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";
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
> = ViewBase<TApiEndpoints, TParamsSchema> & {
  type: "resource-create";
  schema: TSchema;
  /**
   * Optional schema for URL parameters this view expects.
   */
  schemaParams?: TParamsSchema;
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

export type ResourceViewView<
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
> = ViewBase<TApiEndpoints, TParamsSchema, Infer<TSchema>> & {
  type: "resource-view";
  schema: TSchema;
  /**
   * Optional schema for URL parameters this view expects.
   */
  schemaParams?: TParamsSchema;
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
};

export type ResourceSearchView<
  TSchema extends ArraySchema<any> = ArraySchema<any>,
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
> = ViewBase<TApiEndpoints, TParamsSchema> & {
  type: "resource-search";
  schema: TSchema;
  /**
   * Optional schema for URL parameters this view expects.
   */
  schemaParams?: TParamsSchema;
  /**
   * Loads the search results data.
   */
  onLoad: ({
    context,
  }: {
    context: NubaseContextData<TApiEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<Infer<TSchema>>>;
};

export type View<
  TSchema extends ObjectSchema<any> | ArraySchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
> =
  | ResourceCreateView<
      TSchema extends ObjectSchema<any> ? TSchema : ObjectSchema<any>,
      TApiEndpoints,
      TParamsSchema
    >
  | ResourceViewView<
      TSchema extends ObjectSchema<any> ? TSchema : ObjectSchema<any>,
      TApiEndpoints,
      TParamsSchema
    >
  | ResourceSearchView<
      TSchema extends ArraySchema<any> ? TSchema : ArraySchema<any>,
      TApiEndpoints,
      TParamsSchema
    >;
