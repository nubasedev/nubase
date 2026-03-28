import { emptySchema, nu, type RequestSchema } from "@nubase/core";

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
