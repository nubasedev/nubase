import { emptySchema, type RequestSchema } from "@nubase/core";
import { ticketSchema } from "../../schema/ticket-schema";

export const postTicketSchema = {
  method: "POST" as const,
  path: "/tickets",
  requestParams: emptySchema,
  requestBody: ticketSchema.omit("id"),
  responseBody: ticketSchema,
} satisfies RequestSchema;
