import { apiEndpoints } from "questlog-schema";
import { viewFactory } from "./factory";

export const createTicketView = viewFactory.createCreate({
  id: "create-ticket",
  title: "Create Ticket",
  schema: apiEndpoints.postTicket.requestBody,
  onSubmit: async ({ data, context }) => {
    return await context.http.postTicket({ data });
  },
});
