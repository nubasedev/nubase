import { type RequestSchema, nu } from "@nubase/core";

export const ticketBaseSchema = nu
	.object({
		id: nu.number(),
		title: nu.string().withComputedMeta({
			label: "Title",
			placeholder: "Enter ticket title",
		}),
		description: nu.string().optional().withComputedMeta({
			label: "Description",
			placeholder: "Enter ticket description",
			renderer: "multiline",
		}),
		createdAt: nu.string().optional().withComputedMeta({
			label: "Created At",
		}),
		updatedAt: nu.string().optional().withComputedMeta({
			label: "Updated At",
		}),
	})
	.withId("id")
	.withTableLayouts({
		default: {
			fields: ["id", "title", "description", "createdAt"],
		},
	});

export type Ticket = (typeof ticketBaseSchema)["_output"];

export const getTicketsSchema = {
	method: "GET",
	path: "/tickets",
	requestParams: ticketBaseSchema.omit("id", "createdAt", "updatedAt").partial(),
	responseBody: nu.array(ticketBaseSchema),
} satisfies RequestSchema;

export const getTicketSchema = {
	method: "GET",
	path: "/tickets/:id",
	pathParams: nu.object({ id: nu.number() }),
	responseBody: ticketBaseSchema,
} satisfies RequestSchema;

export const postTicketSchema = {
	method: "POST",
	path: "/tickets",
	requestBody: ticketBaseSchema.omit("id", "createdAt", "updatedAt"),
	responseBody: ticketBaseSchema,
} satisfies RequestSchema;

export const patchTicketSchema = {
	method: "PATCH",
	path: "/tickets/:id",
	pathParams: nu.object({ id: nu.number() }),
	requestBody: ticketBaseSchema.omit("id", "createdAt", "updatedAt").partial(),
	responseBody: ticketBaseSchema,
} satisfies RequestSchema;

export const deleteTicketSchema = {
	method: "DELETE",
	path: "/tickets/:id",
	pathParams: nu.object({ id: nu.number() }),
	responseBody: nu.object({ success: nu.boolean() }),
} satisfies RequestSchema;
