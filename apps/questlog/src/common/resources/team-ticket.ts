import { ticketListSchema } from "./ticket";

/**
 * View-shape schema for tickets when shown as children of a team
 * (e.g. on the Team view screen). Reuses the ticketListSchema shape
 * (so it lines up with the getTickets endpoint response) but defines
 * its own table layout with the columns appropriate to the Team context.
 *
 * No own endpoint and no own resource — just a column shape.
 */
export const teamTicketSchema = ticketListSchema.withTableLayout({
  fields: [
    { name: "id", label: "ID", columnWidthPx: 80, pinned: true },
    { name: "title", label: "Title", columnWidthPx: 300, pinned: true },
    { name: "assigneeName", label: "Assignee", columnWidthPx: 200 },
  ],
});
