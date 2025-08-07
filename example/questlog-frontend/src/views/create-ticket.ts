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

    // Temporary fix: Handle navigation directly here since ResourceCreateViewRenderer.onSubmit isn't being called
    // Check if there's a view operation and navigate to it
    const ticketResource = context.config.resources?.ticket;
    if (ticketResource?.operations.view && response.data?.id) {
      console.info("Navigating to ticket view page with ID:", response.data.id);
      document.title = `NAVIGATING FROM VIEW ONSUBMIT - ${document.title}`;

      // Use window.location to navigate since we don't have access to TanStack Router navigate here
      const viewUrl = `/r/ticket/view?id=${response.data.id}`;
      window.location.href = viewUrl;
    }

    return response;
  },
});
