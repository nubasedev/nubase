import { emptySchema, type RequestSchema } from "@nubase/core";
import { teamSchema } from "../../resources/team";

export const postTeamSchema = {
  method: "POST" as const,
  path: "/teams",
  requestParams: emptySchema,
  requestBody: teamSchema.omit("id"),
  responseBody: teamSchema,
} satisfies RequestSchema;
