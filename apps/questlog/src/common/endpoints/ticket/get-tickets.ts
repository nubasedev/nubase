import { nu, type RequestSchema, withSearchParams } from "@nubase/core";
import { ticketListSchema } from "../../schema/ticket-schema";

// The request's filterable universe and NQL's queryable universe are the
// same shape (list-view fields, minus the row id). Using `ticketListSchema`
// here keeps the wire contract, the generated frontend types, and the
// backend NQL bindings all aligned.
export const getTicketsSchema = {
  method: "GET" as const,
  path: "/tickets",
  requestParams: withSearchParams(ticketListSchema.omit("id").partial()),
  responseBody: nu.array(ticketListSchema),
} satisfies RequestSchema;
