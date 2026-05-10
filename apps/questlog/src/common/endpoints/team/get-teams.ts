import { nu, type RequestSchema, withSearchParams } from "@nubase/core";
import { teamListSchema } from "../../resources/team";

// Filterable params: list-view fields (minus id) plus a userId filter so the
// User view's "Teams" relation can call this endpoint scoped to one user.
export const getTeamsSchema = {
  method: "GET" as const,
  path: "/teams",
  requestParams: withSearchParams(
    teamListSchema
      .omit("id")
      .partial()
      .extend({ userId: nu.number().optional() }),
  ),
  responseBody: nu.array(teamListSchema),
} satisfies RequestSchema;
