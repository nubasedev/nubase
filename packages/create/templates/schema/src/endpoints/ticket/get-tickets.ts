import { nu, type RequestSchema } from "@nubase/core";
import { ticketSchema } from "../../resources/ticket";

export const getTicketsSchema = {
	method: "GET" as const,
	path: "/tickets",
	requestParams: ticketSchema.omit("id").partial(),
	responseBody: nu.array(ticketSchema),
} satisfies RequestSchema;
