import { emptySchema, nu, type RequestSchema } from "@nubase/core";
import { userSchema } from "./user";
import { workspaceInfoSchema } from "./workspace";

/**
 * Signup request schema
 * POST /auth/signup
 *
 * Creates a new workspace and the initial admin user.
 * After successful signup, the user is automatically logged in.
 */
export const signupSchema = {
	method: "POST" as const,
	path: "/auth/signup",
	requestParams: emptySchema,
	requestBody: nu.object({
		/** Workspace slug (unique identifier) */
		workspace: nu.string(),
		/** Display name for the workspace */
		workspaceName: nu.string(),
		/** Email for the admin user */
		email: nu.string(),
		/** Display name for the admin user */
		displayName: nu.string(),
		/** Password for the admin user */
		password: nu.string(),
	}),
	responseBody: nu.object({
		user: userSchema,
		workspace: workspaceInfoSchema,
	}),
} satisfies RequestSchema;
