import { nu, type RequestSchema, withSearchParams } from "@nubase/core";
import { teamListSchema } from "../../resources/team";

export const getTeamsSchema = {
  method: "GET" as const,
  path: "/teams",
  requestParams: withSearchParams(teamListSchema.omit("id").partial()),
  responseBody: nu.array(teamListSchema),
} satisfies RequestSchema;
