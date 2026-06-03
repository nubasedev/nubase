import { createResource, deleteAction } from "@nubase/frontend";
import { apiEndpoints } from "../../common";

export const ticketResource = createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  .withActions({
    delete: deleteAction({
      resourceName: "ticket",
      deleteOne: ({ id, context }) =>
        context.http.deleteTicket({ params: { id: Number(id) } }),
    }),
  })
  .withViews({
    create: {
      type: "resource-create",
      title: "Create Ticket",
      schema: (api) => api.postTicket.requestBody,
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
    },
    search: {
      type: "resource-search",
      title: "Search Tickets",
      schema: (api) => api.getTickets.responseBody,
      schemaFilter: (api) => api.getTickets.requestParams,
      breadcrumbs: () => [{ label: "Tickets", to: "/r/ticket/search" }],
      actions: ["delete"],
      onLoad: async ({ context }) => {
        return context.http.getTickets({
          params: context.params || {},
        });
      },
    },
  });
