import { nu } from "@nubase/core";

const ticketSchema = nu.object({
  name: nu.string().meta({
    label: "Ticket Name",
    description: "Enter the name of the ticket",
  }),
  category: nu.string().meta({
    label: "Category",
    description: "Enter the category of the ticket",
  }),
});
