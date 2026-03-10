import {
	idNumberSchema,
	type RequestSchema,
	successSchema,
} from "@nubase/core";

export const deleteTicketSchema = {
	method: "DELETE" as const,
	path: "/tickets/:id",
	requestParams: idNumberSchema,
	responseBody: successSchema,
} satisfies RequestSchema;
