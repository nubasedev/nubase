import { viewFactory } from "./factory";

export const createTicketView = viewFactory.createCreate({
  id: "create-ticket",
  title: "Create Ticket",
  schema: (api) => api.postTicket.requestBody,
  onSubmit: async ({ data, context }) => {
    return context.http.postTicket({ data });
  },
});
