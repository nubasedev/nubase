import {
	deleteTicketSchema,
	getTicketSchema,
	getTicketsSchema,
	patchTicketSchema,
	postTicketSchema,
} from "./schema/ticket";
import {
	getMeSchema,
	loginCompleteSchema,
	loginSchema,
	loginStartSchema,
	logoutSchema,
	signupSchema,
} from "./schema/auth";

export const apiEndpoints = {
	// Tickets
	getTickets: getTicketsSchema,
	getTicket: getTicketSchema,
	postTicket: postTicketSchema,
	patchTicket: patchTicketSchema,
	deleteTicket: deleteTicketSchema,

	// Auth
	loginStart: loginStartSchema,
	loginComplete: loginCompleteSchema,
	login: loginSchema,
	logout: logoutSchema,
	getMe: getMeSchema,
	signup: signupSchema,
} as const;

export type ApiEndpoints = typeof apiEndpoints;
