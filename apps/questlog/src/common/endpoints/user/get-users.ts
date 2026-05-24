import { nu, type RequestSchema, withSearchParams } from "@nubase/core";
import { userSchema } from "../../schema/user-schema";

export const getUsersSchema = {
  method: "GET" as const,
  path: "/users",
  requestParams: withSearchParams(
    userSchema.omit("id").partial().extend({ teamId: nu.number().optional() }),
  ),
  responseBody: nu.array(userSchema),
} satisfies RequestSchema;
