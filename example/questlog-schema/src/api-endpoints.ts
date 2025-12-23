import type { RequestSchema } from "@nubase/core";
import {
  getMeSchema,
  loginCompleteSchema,
  loginSchema,
  loginStartSchema,
  logoutSchema,
  signupSchema,
} from "./schema/auth";
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
  // Auth endpoints - Two-step login flow
  loginStart: loginStartSchema, // POST /auth/login/start - Step 1: validate credentials, get workspaces
  loginComplete: loginCompleteSchema, // POST /auth/login/complete - Step 2: select workspace, get token
  login: loginSchema, // POST /auth/login (legacy - deprecated)
  logout: logoutSchema, // POST /auth/logout
  getMe: getMeSchema, // GET /auth/me
  signup: signupSchema, // POST /auth/signup - Create new workspace and admin user

  // Ticket endpoints
  getTickets: getTicketsSchema, // GET /tickets
  getTicket: getTicketSchema, // GET /tickets/:id
  postTicket: postTicketSchema, // POST /tickets
  patchTicket: patchTicketSchema, // PUT /tickets/:id
  deleteTicket: deleteTicketSchema, // DELETE /tickets/:id
} satisfies Record<string, RequestSchema>;

export type ApiEndpoints = typeof apiEndpoints;
