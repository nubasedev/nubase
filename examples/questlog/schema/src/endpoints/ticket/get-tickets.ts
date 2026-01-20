import { nu, type RequestSchema, withSearchParams } from "@nubase/core";
import { ticketSchema } from "../../resources/ticket";

export const getTicketsSchema = {
  method: "GET" as const,
  path: "/tickets",
  requestParams: withSearchParams(ticketSchema.omit("id").partial()),
  responseBody: nu.array(ticketSchema),
} satisfies RequestSchema;
