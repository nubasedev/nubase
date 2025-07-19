import type { CreateView } from "@nubase/core";
import { ticket } from "../schema/ticket";

export const createTicketView: CreateView = {
  type: "create",
  title: "Create Ticket",
  id: "create-ticket",
  schema: ticket,
};
