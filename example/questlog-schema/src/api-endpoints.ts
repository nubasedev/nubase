import type { RequestSchema } from "@nubase/core";
import {
  deleteTicketSchema,
  getTicketSchema,
  getTicketsSchema,
  patchTicketSchema,
  postTicketSchema,
} from "./schema/ticket";

/**
 * Flattened API endpoints at root level.
 * Nested endpoints are flattened with category prefix: ticketsCreateTicket, ticketsUpdateTicket, etc.
 */
export const apiEndpoints = {
  // Flatten ticket endpoints with descriptive names
  getTickets: getTicketsSchema, // GET /tickets
  getTicket: getTicketSchema, // GET /tickets/:id
  postTicket: postTicketSchema, // POST /tickets
  patchTicket: patchTicketSchema, // PUT /tickets/:id
  deleteTicket: deleteTicketSchema, // DELETE /tickets/:id
} satisfies Record<string, RequestSchema>;

export type ApiEndpoints = typeof apiEndpoints;
