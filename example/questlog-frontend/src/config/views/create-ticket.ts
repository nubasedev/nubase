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
  createResource: async ({ data, context }) => {
    try {
      const response = await context.http.postTicket({ data });
      console.info("Ticket created successfully:", response.data);
      console.info("App context available:", context.config.appName);
      return response;
    } catch (error) {
      // Force the browser to display the error beautifully
      if (
        error &&
        typeof error === "object" &&
        "toJSON" in error &&
        typeof error.toJSON === "function"
      ) {
        console.error(
          "Error creating ticket:",
          JSON.stringify(error.toJSON(), null, 2),
        );
      } else {
        console.error("Error creating ticket:", error);
      }
      throw error;
    }
  },
});
