import { emptySchema, type RequestSchema } from "@nubase/core";
import { ticketBaseSchema } from "./ticket-base";

export const postTicketSchema = {
	method: "POST" as const,
	path: "/tickets",
	requestParams: emptySchema,
	requestBody: ticketBaseSchema.omit("id"),
	responseBody: ticketBaseSchema,
} satisfies RequestSchema;
