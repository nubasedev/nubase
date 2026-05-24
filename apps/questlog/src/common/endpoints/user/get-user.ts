import { idNumberSchema, type RequestSchema } from "@nubase/core";
import { userSchema } from "../../schema/user-schema";

export const getUserSchema = {
  method: "GET" as const,
  path: "/users/:id",
  requestParams: idNumberSchema,
  responseBody: userSchema,
} satisfies RequestSchema;
