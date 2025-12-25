import { createResource } from "@nubase/frontend";
import { apiEndpoints } from "__PROJECT_NAME__-schema";

export const ticketResource = createResource("ticket")
	.withApiEndpoints(apiEndpoints)
	.withViews({
		create: {
			type: "resource-create",
			id: "create-ticket",
			title: "Create Ticket",
			schemaPost: (api) => api.postTicket.requestBody,
			breadcrumbs: [
				{ label: "Tickets", to: "/r/ticket/search" },
				"Create Ticket",
			],
			onSubmit: async ({ data, context }) => {
				return context.http.postTicket({ data });
			},
		},
		view: {
			type: "resource-view",
			id: "view-ticket",
			title: "View Ticket",
			schemaGet: (api) => api.getTicket.responseBody.omit("id"),
			schemaParams: (api) => api.getTicket.requestParams,
			breadcrumbs: ({ context, data }) => [
				{ label: "Tickets", to: "/r/ticket/search" },
				{
					label: data?.title || `Ticket #${context.params?.id || "Unknown"}`,
				},
			],
			onLoad: async ({ context }) => {
				return context.http.getTicket({
					params: { id: context.params.id },
				});
			},
			onPatch: async ({ data, context }) => {
				return context.http.patchTicket({
					params: { id: context.params.id },
					data: data,
				});
			},
		},
		search: {
			type: "resource-search",
			id: "search-tickets",
			title: "Search Tickets",
			schemaGet: (api) => api.getTickets.responseBody,
			breadcrumbs: () => [{ label: "Tickets", to: "/r/ticket/search" }],
			onLoad: async ({ context }) => {
				return context.http.getTickets({
					params: {},
				});
			},
		},
	});
