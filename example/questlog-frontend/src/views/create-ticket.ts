import { createCreateView } from "@nubase/frontend";
import { type apiEndpoints, postTicketSchema } from "questlog-schema";

export const createTicketViewSchema = postTicketSchema.requestBody;

export const createTicketView = createCreateView<
  typeof createTicketViewSchema,
  typeof apiEndpoints
>({
  id: "create-ticket",
  title: "Create Ticket",
  schema: createTicketViewSchema,
  onSubmit: async ({ data, context }) => {
    return await context.http.postTicket({ data });
  },
});
