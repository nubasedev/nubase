import type { CreateView } from "@nubase/core";
import { ticket } from "../schema/ticket";

export const createTicketView: CreateView = {
  type: "create",
  id: "create-ticket",
  title: "Create Ticket",
  schema: ticket,
  onSubmit: async ({ data, http }) => {
    http.post("/tickets", data);
  },
};
