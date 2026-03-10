import { emptySchema, nu, type RequestSchema } from "@nubase/core";
import { userSchema } from "../../resources/user";
import { workspaceSchema } from "../../resources/workspace";

/**
 * Login complete request schema - Step 2 of two-step auth
 * POST /auth/login/complete
 *
 * Completes login by selecting a workspace and issuing the full auth token.
 */
export const loginCompleteSchema = {
	method: "POST" as const,
	path: "/auth/login/complete",
	requestParams: emptySchema,
	requestBody: nu.object({
		/** Temporary login token from login/start */
		loginToken: nu.string(),
		/** Selected workspace slug */
		workspace: nu.string(),
	}),
	responseBody: nu.object({
		user: userSchema,
		workspace: workspaceSchema,
	}),
} satisfies RequestSchema;
