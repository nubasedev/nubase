import { createResource } from "@nubase/frontend";
import { createTicketView } from "../views/create-ticket";

export const ticketResource = createResource({
  id: "ticket",
  operations: {
    create: {
      view: createTicketView,
    },
    // Additional operations can be added here as more views are created
    // view: {
    //   view: viewTicketView,
    // },
    // edit: {
    //   view: editTicketView,
    // },
  },
});
