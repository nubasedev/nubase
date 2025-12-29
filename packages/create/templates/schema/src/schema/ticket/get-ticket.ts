import { idNumberSchema, type RequestSchema } from "@nubase/core";
import { ticketBaseSchema } from "./ticket-base";

export const getTicketSchema = {
	method: "GET" as const,
	path: "/tickets/:id",
	requestParams: idNumberSchema,
	responseBody: ticketBaseSchema,
} satisfies RequestSchema;
