import { emptySchema, nu, type RequestSchema } from "@nubase/core";
import { workspaceSchema } from "./workspace";

/**
 * Login start request schema - Step 1 of two-step auth
 * POST /auth/login/start
 *
 * Validates credentials and returns list of workspaces the user belongs to.
 * If user has multiple workspaces, frontend should show selection.
 * If user has one workspace, frontend can auto-complete login.
 */
export const loginStartSchema = {
  method: "POST" as const,
  path: "/auth/login/start",
  requestParams: emptySchema,
  requestBody: nu.object({
    username: nu.string(),
    password: nu.string(),
  }),
  responseBody: nu.object({
    /** Temporary token for completing login (short-lived) */
    loginToken: nu.string(),
    /** User's username (for display) */
    username: nu.string(),
    /** List of workspaces the user belongs to */
    workspaces: nu.array(workspaceSchema),
  }),
} satisfies RequestSchema;
