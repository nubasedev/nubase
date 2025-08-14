import { createResource, createViewFactory } from "@nubase/frontend";
import { apiEndpoints } from "questlog-schema";

// Create a factory pre-configured with API endpoints
const viewFactory = createViewFactory(apiEndpoints);

export const ticketResource = createResource({
  id: "ticket",
  operations: {
    create: {
      view: viewFactory.createCreate({
        id: "create-ticket",
        title: "Create Ticket",
        schema: (api) => api.postTicket.requestBody,
        breadcrumbs: [
          { label: "Tickets", to: "/r/ticket/search" },
          "Create Ticket",
        ],
        onSubmit: async ({ data, context }) => {
          return context.http.postTicket({ data });
        },
      }),
    },
    view: {
      view: viewFactory.createView({
        id: "view-ticket",
        title: "View Ticket",
        schema: (api) => api.getTicket.responseBody.omit("id"),
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
      }),
    },
    search: {
      view: viewFactory.createSearch({
        id: "search-tickets",
        title: "Search Tickets",
        schema: (api) => api.getTickets.responseBody,
        breadcrumbs: ({ context, data }) => [
          { label: "Tickets", to: "/r/ticket/search" },
        ],
        onLoad: async ({ context }) => {
          return context.http.getTickets({
            params: {},
          });
        },
      }),
    },
  },
});
