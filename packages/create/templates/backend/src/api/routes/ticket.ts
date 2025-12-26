import { createHttpHandler, HttpError } from "@nubase/backend";
import { eq } from "drizzle-orm";
import { apiEndpoints } from "schema";
import { getDb } from "../../db/helpers/drizzle";
import { tickets } from "../../db/schema";

export const ticketHandlers = {
	getTickets: createHttpHandler({
		endpoint: apiEndpoints.getTickets,
		handler: async () => {
			const allTickets = await getDb().select().from(tickets);
			return allTickets.map((ticket) => ({
				id: ticket.id,
				title: ticket.title,
				description: ticket.description ?? undefined,
			}));
		},
	}),

	getTicket: createHttpHandler({
		endpoint: apiEndpoints.getTicket,
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
			};
		},
	}),

	postTicket: createHttpHandler({
		endpoint: apiEndpoints.postTicket,
		handler: async ({ body }) => {
			const [ticket] = await getDb()
				.insert(tickets)
				.values({
					workspaceId: 1, // TODO: Get from context
					title: body.title,
					description: body.description,
				})
				.returning();

			if (!ticket) {
				throw new HttpError(500, "Failed to create ticket");
			}

			return {
				id: ticket.id,
				title: ticket.title,
				description: ticket.description ?? undefined,
			};
		},
	}),

	patchTicket: createHttpHandler({
		endpoint: apiEndpoints.patchTicket,
		handler: async ({ params, body }) => {
			const updateData: { title?: string; description?: string; updatedAt: Date } = {
				updatedAt: new Date(),
			};

			if (body.title !== undefined) {
				updateData.title = body.title;
			}
			if (body.description !== undefined) {
				updateData.description = body.description;
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
			};
		},
	}),

	deleteTicket: createHttpHandler({
		endpoint: apiEndpoints.deleteTicket,
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
