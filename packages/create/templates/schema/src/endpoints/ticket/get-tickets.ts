import { nu, type RequestSchema, withSearchParams } from "@nubase/core";
import { ticketListSchema, ticketSchema } from "../../resources/ticket";

export const getTicketsSchema = {
	method: "GET" as const,
	path: "/tickets",
	requestParams: withSearchParams(ticketSchema.omit("id").partial()),
	responseBody: nu.array(ticketListSchema),
} satisfies RequestSchema;
