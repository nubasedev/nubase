import type { ObjectView } from "@nubase/core";
import { ticket } from "../schema/ticket";

export const createTicketView: ObjectView = {
  type: "object",
  title: "Create Ticket",
  schema: ticket,
};
