import { idNumberSchema, type RequestSchema } from "@nubase/core";
import { userSchema } from "../../resources/user";

export const getUserSchema = {
  method: "GET" as const,
  path: "/users/:id",
  requestParams: idNumberSchema,
  responseBody: userSchema,
} satisfies RequestSchema;
