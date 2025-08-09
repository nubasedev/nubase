import type { Infer, ObjectSchema } from "@nubase/core";
import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";
import type { ResourceCreateView, ResourceViewView } from "./view";

/**
 * Creates a view factory pre-configured with API endpoints type.
 * This eliminates the need to specify the endpoints type for each view.
 */
export function createViewFactory<TApiEndpoints>() {
  return {
    createView<
      TSchema extends ObjectSchema<any>,
      TParamsSchema extends ObjectSchema<any> | undefined = undefined,
    >(config: {
      id: string;
      title: string;
      schema: TSchema;
      schemaParams?: TParamsSchema;
      onLoad: (args: {
        context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      }) => Promise<HttpResponse<Infer<TSchema>>>;
      onPatch: (args: {
        data: Partial<Infer<TSchema>>;
        context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      }) => Promise<HttpResponse<any>>;
    }): ResourceViewView<TSchema, TApiEndpoints, TParamsSchema> {
      return {
        type: "resource-view",
        ...config,
      };
    },

    createCreate<
      TSchema extends ObjectSchema<any>,
      TParamsSchema extends ObjectSchema<any> | undefined = undefined,
    >(config: {
      id: string;
      title: string;
      schema: TSchema;
      schemaParams?: TParamsSchema;
      onSubmit: (args: {
        data: Infer<TSchema>;
        context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      }) => Promise<HttpResponse<any>>;
    }): ResourceCreateView<TSchema, TApiEndpoints, TParamsSchema> {
      return {
        type: "resource-create",
        ...config,
      };
    },
  };
}
