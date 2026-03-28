import { nu, type RequestSchema, withSearchParams } from "@nubase/core";
import { userSchema } from "../../resources/user";

export const getUsersSchema = {
	method: "GET" as const,
	path: "/users",
	requestParams: withSearchParams(userSchema.omit("id").partial()),
	responseBody: nu.array(userSchema),
} satisfies RequestSchema;
