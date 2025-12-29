import { emptySchema, nu, type RequestSchema } from "@nubase/core";
import { userSchema } from "./user";

/**
 * Get current user schema
 * GET /auth/me
 */
export const getMeSchema = {
	method: "GET" as const,
	path: "/auth/me",
	requestParams: emptySchema,
	responseBody: nu.object({
		user: userSchema.optional(),
	}),
} satisfies RequestSchema;
