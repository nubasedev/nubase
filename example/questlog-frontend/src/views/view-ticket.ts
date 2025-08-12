import { viewFactory } from "./factory";

export const viewTicketView = viewFactory.createView({
  id: "view-ticket",
  title: "View Ticket",
  schema: (api) => api.getTicket.responseBody.omit("id"),
  schemaParams: (api) => api.getTicket.requestParams,
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
});
