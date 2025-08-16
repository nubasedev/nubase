import type { Infer, ObjectSchema } from "./schema";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestSchema {
  method: HttpMethod;
  path: string;
  requestParams: ObjectSchema;
  requestBody?: ObjectSchema;
  responseBody: ObjectSchema | any; // Allow arrays and other schemas
}

export type InferRequestParams<T extends RequestSchema> = Infer<
  T["requestParams"]
>;
export type InferRequestBody<T extends RequestSchema> =
  T["requestBody"] extends ObjectSchema ? Infer<T["requestBody"]> : undefined;
export type InferResponseBody<T extends RequestSchema> = Infer<
  T["responseBody"]
>;
