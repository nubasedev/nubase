import { createResource } from "@nubase/frontend";
import { createTicketView } from "../views/create-ticket";
import { viewTicketView } from "../views/view-ticket";

export const ticketResource = createResource({
  id: "ticket",
  operations: {
    create: {
      view: createTicketView,
    },
    view: {
      view: viewTicketView,
    },
  },
});
