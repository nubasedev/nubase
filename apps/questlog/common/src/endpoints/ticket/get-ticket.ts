import { idNumberSchema, type RequestSchema } from "@nubase/core";
import { ticketSchema } from "../../resources/ticket";

export const getTicketSchema = {
  method: "GET" as const,
  path: "/tickets/:id",
  requestParams: idNumberSchema,
  responseBody: ticketSchema,
} satisfies RequestSchema;
