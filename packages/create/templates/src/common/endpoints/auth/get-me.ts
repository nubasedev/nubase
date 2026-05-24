import { emptySchema, nu, type RequestSchema } from "@nubase/core";
import { userSchema } from "../../schema/user-schema";
import { workspaceSchema } from "../../schema/workspace-schema";

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
