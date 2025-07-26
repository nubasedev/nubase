import type { ObjectSchema } from "@nubase/core";
import type { HttpClient, HttpResponse } from "../http/http-client";

export type ViewType = "object";

export type ViewBase = {
  title: string;
  id: string;
};

export type CreateView = ViewBase & {
  type: "create";
  schema: ObjectSchema<any>;
  onSubmit: ({
    data,
    http,
  }: { data: any; http: HttpClient }) => Promise<HttpResponse<any>>;
};

export type ViewView = ViewBase & {
  type: "view";
  schema: ObjectSchema<any>;
};

export type View = CreateView | ViewView;
