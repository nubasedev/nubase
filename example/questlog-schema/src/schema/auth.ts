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
 * Login request schema
 * POST /auth/login
 */
export const loginSchema = {
  method: "POST" as const,
  path: "/auth/login",
  requestParams: emptySchema,
  requestBody: nu.object({
    username: nu.string(),
    password: nu.string(),
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
