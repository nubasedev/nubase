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
> = ViewBase & {
  type: "resource-create";
  schema: TSchema;
  /**
   * Creates a new resource.
   */
  onSubmit: ({
    data,
    context,
  }: {
    data: Infer<TSchema>;
    context: NubaseContextData<TApiEndpoints>;
  }) => Promise<HttpResponse<any>>;
};

export type ResourceViewView<
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
> = ViewBase & {
  type: "resource-view";
  schema: TSchema;
  /**
   * Patches a resource with partial data.
   */
  onPatch: ({
    data,
    context,
  }: {
    data: Partial<Infer<TSchema>>;
    context: NubaseContextData<TApiEndpoints>;
  }) => Promise<HttpResponse<any>>;
};

export type View<
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
> =
  | ResourceCreateView<TSchema, TApiEndpoints>
  | ResourceViewView<TSchema, TApiEndpoints>;
