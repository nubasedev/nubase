import { nu, type RequestSchema } from "@nubase/core";
import { userSchema } from "../../resources/user";

export const getUsersSchema = {
  method: "GET" as const,
  path: "/users",
  requestParams: userSchema.omit("id").partial(),
  responseBody: nu.array(userSchema),
} satisfies RequestSchema;
