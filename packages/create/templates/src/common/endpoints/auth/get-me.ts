import { emptySchema, nu, type RequestSchema } from "@nubase/core";
import { userSchema } from "../../resources/user";
import { workspaceSchema } from "../../resources/workspace";

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
    workspaces: nu.array(workspaceSchema),
  }),
} satisfies RequestSchema;
