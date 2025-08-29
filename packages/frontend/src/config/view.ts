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
};

export type ResourceSearchView<
  TSchema extends ArraySchema<any> = ArraySchema<any>,
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
  TActionIds extends string = string,
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
};

export type View<
  TSchema extends ObjectSchema<any> | ArraySchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
  TActionIds extends string = string,
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
      TActionIds
    >;
