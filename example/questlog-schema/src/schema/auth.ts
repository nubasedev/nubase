import { emptySchema, nu, type RequestSchema } from "@nubase/core";

/**
 * User schema for authenticated user data
 */
export const userSchema = nu.object({
  id: nu.number(),
  email: nu.string(),
  username: nu.string(),
});

/**
 * Workspace info returned during login
 */
export const workspaceInfoSchema = nu.object({
  id: nu.number(),
  slug: nu.string(),
  name: nu.string(),
});

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
    workspaces: nu.array(workspaceInfoSchema),
  }),
} satisfies RequestSchema;

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
    workspace: workspaceInfoSchema,
  }),
} satisfies RequestSchema;

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

/**
 * Logout request schema
 * POST /auth/logout
 */
export const logoutSchema = {
  method: "POST" as const,
  path: "/auth/logout",
  requestParams: emptySchema,
  responseBody: nu.object({
    success: nu.boolean(),
  }),
} satisfies RequestSchema;

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
    /** Username for the admin user */
    username: nu.string(),
    /** Email for the admin user */
    email: nu.string(),
    /** Password for the admin user */
    password: nu.string(),
  }),
  responseBody: nu.object({
    user: userSchema,
    workspace: workspaceInfoSchema,
  }),
} satisfies RequestSchema;
