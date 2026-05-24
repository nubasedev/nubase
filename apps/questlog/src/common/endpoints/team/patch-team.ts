import { idNumberSchema, type RequestSchema } from "@nubase/core";
import { teamSchema } from "../../schema/team-schema";

export const patchTeamSchema = {
  method: "PATCH" as const,
  path: "/teams/:id",
  requestParams: idNumberSchema,
  requestBody: teamSchema.omit("id").partial(),
  responseBody: teamSchema,
} satisfies RequestSchema;
