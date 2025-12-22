import type { RequestSchema } from "@nubase/core";
import { getMeSchema, loginSchema, logoutSchema } from "./schema/auth";
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
  // Auth endpoints
  login: loginSchema, // POST /auth/login
  logout: logoutSchema, // POST /auth/logout
  getMe: getMeSchema, // GET /auth/me

  // Ticket endpoints
  getTickets: getTicketsSchema, // GET /tickets
  getTicket: getTicketSchema, // GET /tickets/:id
  postTicket: postTicketSchema, // POST /tickets
  patchTicket: patchTicketSchema, // PUT /tickets/:id
  deleteTicket: deleteTicketSchema, // DELETE /tickets/:id
} satisfies Record<string, RequestSchema>;

export type ApiEndpoints = typeof apiEndpoints;
