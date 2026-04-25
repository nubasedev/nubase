import {
  idNumberSchema,
  type RequestSchema,
  successSchema,
} from "@nubase/core";

export const deleteUserSchema = {
  method: "DELETE" as const,
  path: "/users/:id",
  requestParams: idNumberSchema,
  responseBody: successSchema,
} satisfies RequestSchema;
