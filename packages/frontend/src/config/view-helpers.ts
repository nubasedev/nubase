import type { Infer, ObjectSchema } from "@nubase/core";
import type { HttpResponse } from "../http/http-client";

/**
 * Helper to create a ResourceViewView with full type inference.
 * Infers all generic types from the provided configuration.
 */
export function defineViewView<
  TSchema extends ObjectSchema<any>,
  TParamsSchema extends ObjectSchema<any> | undefined,
  TConfig extends {
    id: string;
    title: string;
    schema: TSchema;
    schemaParams?: TParamsSchema;
    onLoad: (args: { context: any }) => Promise<HttpResponse<Infer<TSchema>>>;
    onPatch: (args: {
      data: Partial<Infer<TSchema>>;
      context: any;
    }) => Promise<HttpResponse<any>>;
  },
>(config: TConfig): TConfig & { type: "resource-view" } {
  return {
    type: "resource-view" as const,
    ...config,
  };
}

/**
 * Helper to create a ResourceCreateView with full type inference.
 * Infers all generic types from the provided configuration.
 */
export function defineCreateView<
  TSchema extends ObjectSchema<any>,
  TParamsSchema extends ObjectSchema<any> | undefined,
  TConfig extends {
    id: string;
    title: string;
    schema: TSchema;
    schemaParams?: TParamsSchema;
    onSubmit: (args: {
      data: Infer<TSchema>;
      context: any;
    }) => Promise<HttpResponse<any>>;
  },
>(config: TConfig): TConfig & { type: "resource-create" } {
  return {
    type: "resource-create" as const,
    ...config,
  };
}
