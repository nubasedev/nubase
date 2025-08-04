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
>({
  id,
  title,
  schema,
  onSubmit,
}: {
  id: string;
  title: string;
  schema: TSchema;
  onSubmit: ({
    data,
    context,
  }: {
    data: Infer<TSchema>;
    context: NubaseContextData<TEndpoints>;
  }) => Promise<HttpResponse<any>>;
}): ResourceCreateView<TSchema, TEndpoints> {
  return {
    type: "resource-create",
    id,
    title,
    schema,
    onSubmit,
  };
}

/**
 * Factory function to create a ResourceViewView with type inference.
 * Eliminates redundancy by inferring schema and API client types from parameters.
 */
export function createViewView<TSchema extends ObjectSchema<any>, TEndpoints>({
  id,
  title,
  schema,
  onPatch,
}: {
  id: string;
  title: string;
  schema: TSchema;
  onPatch: ({
    data,
    context,
  }: {
    data: Partial<Infer<TSchema>>;
    context: NubaseContextData<TEndpoints>;
  }) => Promise<HttpResponse<any>>;
}): ResourceViewView<TSchema, TEndpoints> {
  return {
    type: "resource-view",
    id,
    title,
    schema,
    onPatch,
  };
}
