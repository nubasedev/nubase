import { nu } from "@nubase/core";
import { createViewView } from "@nubase/frontend";
import { type apiEndpoints, ticketBaseSchema } from "questlog-schema";

export const viewTicketViewSchema = ticketBaseSchema.omit("id").partial();

// Define the parameters schema for this view
export const viewTicketParamsSchema = nu.object({
  id: nu.number(), // Fields are required by default in Nubase
});

export const viewTicketView = createViewView<
  typeof viewTicketViewSchema,
  typeof apiEndpoints,
  typeof viewTicketParamsSchema
>({
  id: "view-ticket",
  title: "View Ticket",
  schema: viewTicketViewSchema,
  schemaParams: viewTicketParamsSchema,
  onLoad: async ({ context }) => {
    // Load the ticket data using the ID from params
    const ticketId = context.params.id;

    const response = await context.http.getTicket({
      params: { id: ticketId },
    });

    console.info("Ticket loaded successfully:", response.data);

    // Return the response which contains the ticket data
    // The data will be used to populate the form
    return response;
  },
  onPatch: async ({ data, context }) => {
    // Now we can access the statically typed params from context
    const ticketId = context.params.id; // This is now type-safe!

    const response = await context.http.patchTicket({
      params: { id: ticketId },
      data: data as any, // Cast to any since PATCH should accept partial data
    });
    console.info("Ticket patched successfully:", response.data);
    console.info("App context available:", context.config.appName);
    console.info("Ticket ID from params:", ticketId);
    return response;
  },
});
