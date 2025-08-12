import { viewFactory } from "./factory";

export const searchTicketsView = viewFactory.createSearch({
  id: "search-tickets",
  title: "Search Tickets",
  schema: (api) => api.getTickets.responseBody,
  onLoad: async ({ context }) => {
    return context.http.getTickets({
      params: {},
    });
  },
});
