import { idNumberSchema, type RequestSchema } from "@nubase/core";
import { ticketSchema } from "../../resources/ticket";

export const patchTicketSchema = {
	method: "PATCH" as const,
	path: "/tickets/:id",
	requestParams: idNumberSchema,
	requestBody: ticketSchema.omit("id").partial(),
	responseBody: ticketSchema,
} satisfies RequestSchema;
