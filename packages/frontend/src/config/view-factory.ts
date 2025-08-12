import type { ArraySchema, Infer, ObjectSchema } from "@nubase/core";
import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";
import type {
  ResourceCreateView,
  ResourceSearchView,
  ResourceViewView,
} from "./view";

/**
 * Creates a view factory pre-configured with API endpoints.
 * This eliminates the need to import apiEndpoints in each view file.
 */
export function createViewFactory<TApiEndpoints>(apiEndpoints: TApiEndpoints) {
  return {
    createView<
      TSchema extends ObjectSchema<any>,
      TParamsSchema extends ObjectSchema<any> | undefined = undefined,
    >(config: {
      id: string;
      title: string;
      schema: (api: TApiEndpoints) => TSchema;
      schemaParams?: (api: TApiEndpoints) => TParamsSchema;
      onLoad: (args: {
        context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      }) => Promise<HttpResponse<Infer<TSchema>>>;
      onPatch: (args: {
        data: Partial<Infer<TSchema>>;
        context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      }) => Promise<HttpResponse<any>>;
    }): ResourceViewView<TSchema, TApiEndpoints, TParamsSchema> {
      const resolvedSchema = config.schema(apiEndpoints);
      const resolvedSchemaParams = config.schemaParams?.(apiEndpoints);

      return {
        type: "resource-view",
        ...config,
        schema: resolvedSchema,
        schemaParams: resolvedSchemaParams,
      };
    },

    createCreate<
      TSchema extends ObjectSchema<any>,
      TParamsSchema extends ObjectSchema<any> | undefined = undefined,
    >(config: {
      id: string;
      title: string;
      schema: (api: TApiEndpoints) => TSchema;
      schemaParams?: (api: TApiEndpoints) => TParamsSchema;
      onSubmit: (args: {
        data: Infer<TSchema>;
        context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      }) => Promise<HttpResponse<any>>;
    }): ResourceCreateView<TSchema, TApiEndpoints, TParamsSchema> {
      const resolvedSchema = config.schema(apiEndpoints);
      const resolvedSchemaParams = config.schemaParams?.(apiEndpoints);

      return {
        type: "resource-create",
        ...config,
        schema: resolvedSchema,
        schemaParams: resolvedSchemaParams,
      };
    },

    createSearch<
      TSchema extends ArraySchema<any>,
      TParamsSchema extends ObjectSchema<any> | undefined = undefined,
    >(config: {
      id: string;
      title: string;
      schema: (api: TApiEndpoints) => TSchema;
      schemaParams?: (api: TApiEndpoints) => TParamsSchema;
      onLoad: (args: {
        context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      }) => Promise<HttpResponse<Infer<TSchema>>>;
    }): ResourceSearchView<TSchema, TApiEndpoints, TParamsSchema> {
      const resolvedSchema = config.schema(apiEndpoints);
      const resolvedSchemaParams = config.schemaParams?.(apiEndpoints);

      return {
        type: "resource-search",
        ...config,
        schema: resolvedSchema,
        schemaParams: resolvedSchemaParams,
      };
    },
  };
}
