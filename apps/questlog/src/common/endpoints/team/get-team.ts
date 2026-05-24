import { idNumberSchema, type RequestSchema } from "@nubase/core";
import { teamSchema } from "../../schema/team-schema";

export const getTeamSchema = {
  method: "GET" as const,
  path: "/teams/:id",
  requestParams: idNumberSchema,
  responseBody: teamSchema,
} satisfies RequestSchema;
