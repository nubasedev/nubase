import { HttpError } from "@nubase/backend";
import type { SQL } from "drizzle-orm";
import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { getDb } from "../../db/helpers/drizzle";
import { tickets, users } from "../../db/schema";
import { createHandler } from "../handler-factory";

export const ticketHandlers = {
	getTickets: createHandler((e) => e.getTickets, {
		handler: async ({ params }) => {
			const db = getDb();

			// Build filter conditions
			const conditions: SQL[] = [];

			// Global text search - OR across searchable text fields
			if (params.q) {
				const searchTerm = `%${params.q}%`;
				const searchCondition = or(
					ilike(tickets.title, searchTerm),
					ilike(tickets.description, searchTerm),
				);
				if (searchCondition) {
					conditions.push(searchCondition);
				}
			}

			// Filter by title (case-insensitive partial match)
			if (params.title) {
				conditions.push(ilike(tickets.title, `%${params.title}%`));
			}

			// Filter by description (case-insensitive partial match)
			if (params.description) {
				conditions.push(ilike(tickets.description, `%${params.description}%`));
			}

			// Filter by assigneeId (supports single value or array for multi-select)
			if (params.assigneeId !== undefined) {
				if (Array.isArray(params.assigneeId)) {
					if (params.assigneeId.length > 0) {
						conditions.push(inArray(tickets.assigneeId, params.assigneeId));
					}
				} else {
					conditions.push(eq(tickets.assigneeId, params.assigneeId));
				}
			}

			const query = db
				.select({
					id: tickets.id,
					title: tickets.title,
					description: tickets.description,
					assigneeId: tickets.assigneeId,
					assigneeName: users.displayName,
					assigneeEmail: users.email,
				})
				.from(tickets)
				.leftJoin(users, eq(tickets.assigneeId, users.id));

			const allTickets =
				conditions.length > 0
					? await query.where(and(...conditions))
					: await query;

			return allTickets.map((ticket) => ({
				id: ticket.id,
				title: ticket.title,
				description: ticket.description ?? undefined,
				assigneeId: ticket.assigneeId ?? undefined,
				assigneeName: ticket.assigneeName ?? undefined,
				assigneeEmail: ticket.assigneeEmail ?? undefined,
			}));
		},
	}),

	getTicket: createHandler((e) => e.getTicket, {
		handler: async ({ params }) => {
			const [ticket] = await getDb()
				.select()
				.from(tickets)
				.where(eq(tickets.id, params.id));

			if (!ticket) {
				throw new HttpError(404, "Ticket not found");
			}

			return {
				id: ticket.id,
				title: ticket.title,
				description: ticket.description ?? undefined,
				assigneeId: ticket.assigneeId ?? undefined,
			};
		},
	}),

	postTicket: createHandler((e) => e.postTicket, {
		handler: async ({ body }) => {
			const [ticket] = await getDb()
				.insert(tickets)
				.values({
					workspaceId: 1, // TODO: Get from context
					title: body.title,
					description: body.description,
					assigneeId: body.assigneeId,
				})
				.returning();

			if (!ticket) {
				throw new HttpError(500, "Failed to create ticket");
			}

			return {
				id: ticket.id,
				title: ticket.title,
				description: ticket.description ?? undefined,
				assigneeId: ticket.assigneeId ?? undefined,
			};
		},
	}),

	patchTicket: createHandler((e) => e.patchTicket, {
		handler: async ({ params, body }) => {
			const updateData: {
				title?: string;
				description?: string;
				assigneeId?: number | null;
				updatedAt: Date;
			} = {
				updatedAt: new Date(),
			};

			if (body.title !== undefined) {
				updateData.title = body.title;
			}
			if (body.description !== undefined) {
				updateData.description = body.description;
			}
			if (body.assigneeId !== undefined) {
				updateData.assigneeId = body.assigneeId;
			}

			const [ticket] = await getDb()
				.update(tickets)
				.set(updateData)
				.where(eq(tickets.id, params.id))
				.returning();

			if (!ticket) {
				throw new HttpError(404, "Ticket not found");
			}

			return {
				id: ticket.id,
				title: ticket.title,
				description: ticket.description ?? undefined,
				assigneeId: ticket.assigneeId ?? undefined,
			};
		},
	}),

	deleteTicket: createHandler((e) => e.deleteTicket, {
		handler: async ({ params }) => {
			const [deleted] = await getDb()
				.delete(tickets)
				.where(eq(tickets.id, params.id))
				.returning();

			if (!deleted) {
				throw new HttpError(404, "Ticket not found");
			}

			return { success: true };
		},
	}),
};
