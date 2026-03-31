import { emptySchema, type RequestSchema } from "@nubase/core";
import { userSchema } from "../../resources/user";

export const postUserSchema = {
  method: "POST" as const,
  path: "/users",
  requestParams: emptySchema,
  requestBody: userSchema.omit("id"),
  responseBody: userSchema,
} satisfies RequestSchema;
