import type { Infer, ObjectSchema } from "@nubase/core";
import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";
import type { CreateView } from "./view";

/**
 * Factory function to create a CreateView with type inference.
 * Eliminates redundancy by inferring schema and API client types from parameters.
 */
export function createCreateView<
  TSchema extends ObjectSchema<any>,
  TEndpoints,
>({
  id,
  title,
  schema,
  endpoints,
  onSubmit,
}: {
  id: string;
  title: string;
  schema: TSchema;
  endpoints: TEndpoints;
  onSubmit: ({
    data,
    context,
  }: {
    data: Infer<TSchema>;
    context: NubaseContextData<TEndpoints>;
  }) => Promise<HttpResponse<any>>;
}): CreateView<TSchema, TEndpoints> {
  return {
    type: "create",
    id,
    title,
    schema,
    onSubmit,
  };
}
