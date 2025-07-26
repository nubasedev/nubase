import type { ArraySchema, Infer, ObjectSchema } from "@nubase/core";
import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";
import type { ActionLayout } from "./action-layout";
import type { BreadcrumbDefinition } from "./breadcrumb";
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
      TActionIds extends string = string,
    >(config: {
      id: string;
      title: string;
      schemaGet: (api: TApiEndpoints) => TSchema;
      schemaParams?: (api: TApiEndpoints) => TParamsSchema;
      actions?: ActionLayout<TActionIds>;
      breadcrumbs?: BreadcrumbDefinition<
        TApiEndpoints,
        TParamsSchema,
        Infer<TSchema>
      >;
      onLoad: (args: {
        context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      }) => Promise<HttpResponse<Infer<TSchema>>>;
      onPatch: (args: {
        data: Partial<Infer<TSchema>>;
        context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      }) => Promise<HttpResponse<any>>;
    }): ResourceViewView<TSchema, TApiEndpoints, TParamsSchema, TActionIds> {
      const resolvedSchema = config.schemaGet(apiEndpoints);
      const resolvedSchemaParams = config.schemaParams?.(apiEndpoints);

      return {
        type: "resource-view",
        ...config,
        schemaGet: resolvedSchema,
        schemaParams: resolvedSchemaParams,
      };
    },

    createCreate<
      TSchema extends ObjectSchema<any>,
      TParamsSchema extends ObjectSchema<any> | undefined = undefined,
      TActionIds extends string = string,
    >(config: {
      id: string;
      title: string;
      schemaPost: (api: TApiEndpoints) => TSchema;
      schemaParams?: (api: TApiEndpoints) => TParamsSchema;
      actions?: ActionLayout<TActionIds>;
      breadcrumbs?: BreadcrumbDefinition<TApiEndpoints, TParamsSchema>;
      onSubmit: (args: {
        data: Infer<TSchema>;
        context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      }) => Promise<HttpResponse<any>>;
    }): ResourceCreateView<TSchema, TApiEndpoints, TParamsSchema, TActionIds> {
      const resolvedSchema = config.schemaPost(apiEndpoints);
      const resolvedSchemaParams = config.schemaParams?.(apiEndpoints);

      return {
        type: "resource-create",
        ...config,
        schemaPost: resolvedSchema,
        schemaParams: resolvedSchemaParams,
      };
    },

    createSearch<
      TSchema extends ArraySchema<any>,
      TParamsSchema extends ObjectSchema<any> | undefined = undefined,
      TActionIds extends string = string,
    >(config: {
      id: string;
      title: string;
      schemaGet: (api: TApiEndpoints) => TSchema;
      schemaParams?: (api: TApiEndpoints) => TParamsSchema;
      tableActions?: ActionLayout<TActionIds>;
      rowActions?: ActionLayout<TActionIds>;
      breadcrumbs?: BreadcrumbDefinition<TApiEndpoints, TParamsSchema>;
      onLoad: (args: {
        context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      }) => Promise<HttpResponse<Infer<TSchema>>>;
    }): ResourceSearchView<TSchema, TApiEndpoints, TParamsSchema, TActionIds> {
      const resolvedSchema = config.schemaGet(apiEndpoints);
      const resolvedSchemaParams = config.schemaParams?.(apiEndpoints);

      return {
        type: "resource-search",
        ...config,
        schemaGet: resolvedSchema,
        schemaParams: resolvedSchemaParams,
      };
    },
  };
}
