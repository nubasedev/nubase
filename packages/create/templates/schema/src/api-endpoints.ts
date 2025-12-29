import {
	getMeSchema,
	loginCompleteSchema,
	loginSchema,
	loginStartSchema,
	logoutSchema,
	signupSchema,
} from "./endpoints/auth";
import {
	getActiveUsersSchema,
	getBrowserStatsSchema,
	getRecentActivitySchema,
	getRevenueChartSchema,
	getSalesChartSchema,
	getTotalRevenueSchema,
} from "./endpoints/dashboard";
import {
	deleteTicketSchema,
	getTicketSchema,
	getTicketsSchema,
	patchTicketSchema,
	postTicketSchema,
} from "./endpoints/ticket";

export const apiEndpoints = {
	// Auth
	loginStart: loginStartSchema,
	loginComplete: loginCompleteSchema,
	login: loginSchema,
	logout: logoutSchema,
	getMe: getMeSchema,
	signup: signupSchema,

	// Tickets
	getTickets: getTicketsSchema,
	getTicket: getTicketSchema,
	postTicket: postTicketSchema,
	patchTicket: patchTicketSchema,
	deleteTicket: deleteTicketSchema,

	// Dashboard widgets
	getRevenueChart: getRevenueChartSchema,
	getBrowserStats: getBrowserStatsSchema,
	getTotalRevenue: getTotalRevenueSchema,
	getActiveUsers: getActiveUsersSchema,
	getSalesChart: getSalesChartSchema,
	getRecentActivity: getRecentActivitySchema,
} as const;

export type ApiEndpoints = typeof apiEndpoints;
