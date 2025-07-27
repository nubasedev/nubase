import type { ObjectSchema } from "./schema";

export interface RequestSchema {
  requestParams: ObjectSchema;
  requestBody: ObjectSchema;
  responseBody: ObjectSchema;
}
