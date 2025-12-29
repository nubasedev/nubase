import { nu, type RequestSchema } from "@nubase/core";
import { ticketBaseSchema } from "./ticket-base";

export const getTicketsSchema = {
  method: "GET" as const,
  path: "/tickets",
  requestParams: ticketBaseSchema.omit("id").partial(),
  responseBody: nu.array(ticketBaseSchema),
} satisfies RequestSchema;
