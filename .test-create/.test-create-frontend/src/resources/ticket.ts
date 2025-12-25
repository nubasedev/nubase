import { createResource } from "@nubase/frontend";
import { apiEndpoints, ticketBaseSchema } from ".test-create-schema";

export const ticketResource = createResource("ticket")
	.withApiEndpoints(apiEndpoints)
	.withViews({
		create: {
			type: "resource-create",
			title: "Create Ticket",
			schema: ticketBaseSchema.omit("id", "createdAt", "updatedAt"),
			submitEndpoint: "postTicket",
		},
		view: {
			type: "resource-view",
			title: "View Ticket",
			schema: ticketBaseSchema,
			fetchEndpoint: "getTicket",
		},
		edit: {
			type: "resource-edit",
			title: "Edit Ticket",
			schema: ticketBaseSchema,
			fetchEndpoint: "getTicket",
			submitEndpoint: "patchTicket",
		},
		search: {
			type: "resource-search",
			title: "Tickets",
			schema: ticketBaseSchema,
			fetchEndpoint: "getTickets",
		},
	});
