import { createViewView } from "@nubase/frontend";
import { type apiEndpoints, patchTicketSchema } from "questlog-schema";

export const viewTicketViewSchema = patchTicketSchema.requestBody;

export const viewTicketView = createViewView<
  typeof viewTicketViewSchema,
  typeof apiEndpoints
>({
  id: "view-ticket",
  title: "View Ticket",
  schema: viewTicketViewSchema,
  onPatch: async ({ data, context }) => {
    // Note: In a real implementation, you would need to get the ticket ID
    // from somewhere (e.g., route params, context, or props)
    const ticketId = 1; // This should be dynamic based on the ticket being viewed

    const response = await context.http.patchTicket({
      params: { id: ticketId },
      data: data as any, // Cast to any since PATCH should accept partial data
    });
    console.info("Ticket patched successfully:", response.data);
    console.info("App context available:", context.config.appName);
    return response;
  },
});
