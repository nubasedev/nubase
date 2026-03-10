import { idNumberSchema, type RequestSchema } from "@nubase/core";
import { userSchema } from "../../resources/user";

export const patchUserSchema = {
	method: "PATCH" as const,
	path: "/users/:id",
	requestParams: idNumberSchema,
	requestBody: userSchema.omit("id").partial(),
	responseBody: userSchema,
} satisfies RequestSchema;
