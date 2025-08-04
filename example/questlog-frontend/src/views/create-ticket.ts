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
    const response = await context.http.postTicket({ data });
    console.info("Ticket created successfully:", response.data);
    console.info("App context available:", context.config.appName);
    return response;
  },
});
