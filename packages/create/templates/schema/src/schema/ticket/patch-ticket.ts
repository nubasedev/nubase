import { idNumberSchema, type RequestSchema } from "@nubase/core";
import { ticketBaseSchema } from "./ticket-base";

export const patchTicketSchema = {
	method: "PATCH" as const,
	path: "/tickets/:id",
	requestParams: idNumberSchema,
	requestBody: ticketBaseSchema.omit("id").partial(),
	responseBody: ticketBaseSchema,
} satisfies RequestSchema;
