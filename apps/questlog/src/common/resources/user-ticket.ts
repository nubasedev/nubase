import { ticketListSchema } from "./ticket";

/**
 * View-shape schema for tickets when shown as children of a user
 * (e.g. on the User view screen). Reuses the ticketListSchema shape
 * (so it lines up with the getTickets endpoint response) but defines
 * its own table layout with the columns appropriate to the User context.
 *
 * No own endpoint and no own resource — just a column shape.
 */
export const userTicketSchema = ticketListSchema.withTableLayouts({
  default: {
    fields: [
      { name: "id", label: "ID", columnWidthPx: 80, pinned: true },
      { name: "title", label: "Title", columnWidthPx: 300, pinned: true },
      { name: "description", label: "Description", columnWidthPx: 400 },
    ],
  },
});
