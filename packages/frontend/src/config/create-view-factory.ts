import type { Infer, ObjectSchema } from "@nubase/core";
import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";
import type { ResourceCreateView, ResourceViewView } from "./view";

/**
 * Factory function to create a ResourceCreateView with type inference.
 * Eliminates redundancy by inferring schema and API client types from parameters.
 */
export function createCreateView<
  TSchema extends ObjectSchema<any>,
  TEndpoints,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
>({
  id,
  title,
  schemaPost,
  schemaParams,
  onSubmit,
}: {
  id: string;
  title: string;
  schemaPost: TSchema;
  schemaParams?: TParamsSchema;
  onSubmit: ({
    data,
    context,
  }: {
    data: Infer<TSchema>;
    context: NubaseContextData<TEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<any>>;
}): ResourceCreateView<TSchema, TEndpoints, TParamsSchema> {
  return {
    type: "resource-create",
    id,
    title,
    schemaPost,
    ...(schemaParams && { schemaParams }),
    onSubmit,
  };
}

/**
 * Factory function to create a ResourceViewView with type inference.
 * Eliminates redundancy by inferring schema and API client types from parameters.
 */
export function createViewView<
  TSchema extends ObjectSchema<any>,
  TEndpoints,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
>({
  id,
  title,
  schemaGet,
  schemaParams,
  onLoad,
  onPatch,
}: {
  id: string;
  title: string;
  schemaGet: TSchema;
  schemaParams?: TParamsSchema;
  onLoad: ({
    context,
  }: {
    context: NubaseContextData<TEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<Infer<TSchema>>>;
  onPatch: ({
    data,
    context,
  }: {
    data: Partial<Infer<TSchema>>;
    context: NubaseContextData<TEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<any>>;
}): ResourceViewView<TSchema, TEndpoints, TParamsSchema> {
  return {
    type: "resource-view",
    id,
    title,
    schemaGet,
    ...(schemaParams && { schemaParams }),
    onLoad,
    onPatch,
  };
}
