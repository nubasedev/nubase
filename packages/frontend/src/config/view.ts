import type { Infer, ObjectSchema } from "@nubase/core";
import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";

export type ViewType = "object";

export type ViewBase = {
  title: string;
  id: string;
};

export type ResourceCreateView<
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
> = ViewBase & {
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
> = ViewBase & {
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

export type View<
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
> =
  | ResourceCreateView<TSchema, TApiEndpoints, TParamsSchema>
  | ResourceViewView<TSchema, TApiEndpoints, TParamsSchema>;
