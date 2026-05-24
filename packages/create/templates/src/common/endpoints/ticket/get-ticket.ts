import { idNumberSchema, type RequestSchema } from "@nubase/core";
import { ticketSchema } from "../../schema/ticket-schema";

export const getTicketSchema = {
  method: "GET" as const,
  path: "/tickets/:id",
  requestParams: idNumberSchema,
  responseBody: ticketSchema,
} satisfies RequestSchema;
