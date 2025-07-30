import type { Infer, ObjectSchema } from "@nubase/core";
import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";

export type ViewType = "object";

export type ViewBase = {
  title: string;
  id: string;
};

export type CreateView<
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
> = ViewBase & {
  type: "create";
  schema: TSchema;
  onSubmit: ({
    data,
    context,
  }: {
    data: Infer<TSchema>;
    context: NubaseContextData<TApiEndpoints>;
  }) => Promise<HttpResponse<any>>;
};

export type ViewView<TSchema extends ObjectSchema<any> = ObjectSchema<any>> =
  ViewBase & {
    type: "view";
    schema: TSchema;
  };

export type View<
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TApiEndpoints = any,
> = CreateView<TSchema, TApiEndpoints> | ViewView<TSchema>;
