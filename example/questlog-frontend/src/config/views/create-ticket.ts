import type { CreateView } from "@nubase/react";
import { ticketPostSchema } from "questlog-schema";

export const createTicketView: CreateView = {
  type: "create",
  id: "create-ticket",
  title: "Create Ticket",
  schema: ticketPostSchema,
  onSubmit: async ({ data, http }) => {
    const response = await http.post("/tickets", data);
    console.info("Ticket created successfully:", response.data);
    return response;
  },
};
