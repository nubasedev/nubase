import { emptySchema, nu, type RequestSchema } from "@nubase/core";
import { userSchema } from "./user";

/**
 * Legacy login request schema (kept for backwards compatibility)
 * POST /auth/login
 *
 * For path-based multi-workspace, the workspace slug is required in the request body.
 * @deprecated Use loginStartSchema and loginCompleteSchema for two-step flow
 */
export const loginSchema = {
  method: "POST" as const,
  path: "/auth/login",
  requestParams: emptySchema,
  requestBody: nu.object({
    username: nu.string(),
    password: nu.string(),
    /** Workspace slug for path-based multi-workspace */
    workspace: nu.string(),
  }),
  responseBody: nu.object({
    user: userSchema,
  }),
} satisfies RequestSchema;
