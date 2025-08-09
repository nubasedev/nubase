import { apiEndpoints } from "questlog-schema";
import { viewFactory } from "./factory";

export const viewTicketView = viewFactory.createView({
  id: "view-ticket",
  title: "View Ticket",
  schema: apiEndpoints.getTicket.responseBody.omit("id"),
  schemaParams: apiEndpoints.getTicket.requestParams,
  onLoad: async ({ context }) => {
    const response = await context.http.getTicket({
      params: { id: context.params.id },
    });
    return response;
  },
  onPatch: async ({ data, context }) => {
    const response = await context.http.patchTicket({
      params: { id: context.params.id },
      data: data as any,
    });
    return response;
  },
});
