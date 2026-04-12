import { HttpError } from "@nubase/backend";
import { getDb } from "../../db/helpers/kysely";
import { createHandler } from "../handler-factory";

export const ticketHandlers = {
	getTickets: createHandler((e) => e.getTickets, {
		handler: async ({ params }) => {
			const db = getDb();

			let query = db
				.selectFrom("tickets")
				.leftJoin("users", "tickets.assigneeId", "users.id")
				.select([
					"tickets.id",
					"tickets.title",
					"tickets.description",
					"tickets.assigneeId",
					"users.displayName as assigneeName",
					"users.email as assigneeEmail",
				]);

			// Global text search - OR across searchable text fields
			if (params.q) {
				const searchTerm = `%${params.q}%`;
				query = query.where((eb) =>
					eb.or([
						eb("tickets.title", "ilike", searchTerm),
						eb("tickets.description", "ilike", searchTerm),
					]),
				);
			}

			// Filter by title (case-insensitive partial match)
			if (params.title) {
				query = query.where("tickets.title", "ilike", `%${params.title}%`);
			}

			// Filter by description (case-insensitive partial match)
			if (params.description) {
				query = query.where(
					"tickets.description",
					"ilike",
					`%${params.description}%`,
				);
			}

			// Filter by assigneeId (supports single value or array for multi-select)
			if (params.assigneeId !== undefined) {
				if (Array.isArray(params.assigneeId)) {
					if (params.assigneeId.length > 0) {
						query = query.where("tickets.assigneeId", "in", params.assigneeId);
					}
				} else {
					query = query.where("tickets.assigneeId", "=", params.assigneeId);
				}
			}

			const allTickets = await query.execute();

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
			const ticket = await getDb()
				.selectFrom("tickets")
				.selectAll()
				.where("id", "=", params.id)
				.executeTakeFirst();

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
			const ticket = await getDb()
				.insertInto("tickets")
				.values({
					workspaceId: 1, // TODO: Get from context
					title: body.title,
					description: body.description,
					assigneeId: body.assigneeId,
				})
				.returningAll()
				.executeTakeFirstOrThrow();

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
			const updateData: Record<string, unknown> = {
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

			const ticket = await getDb()
				.updateTable("tickets")
				.set(updateData)
				.where("id", "=", params.id)
				.returningAll()
				.executeTakeFirst();

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
			const deleted = await getDb()
				.deleteFrom("tickets")
				.where("id", "=", params.id)
				.returningAll()
				.executeTakeFirst();

			if (!deleted) {
				throw new HttpError(404, "Ticket not found");
			}

			return { success: true };
		},
	}),
};
