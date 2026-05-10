import {
  idNumberSchema,
  type RequestSchema,
  successSchema,
} from "@nubase/core";

export const deleteTeamSchema = {
  method: "DELETE" as const,
  path: "/teams/:id",
  requestParams: idNumberSchema,
  responseBody: successSchema,
} satisfies RequestSchema;
