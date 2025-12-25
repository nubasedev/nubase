import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../../db/helpers/drizzle";
import { tickets } from "../../db/schema";

export const ticketHandlers = {
	async getTickets(c: Context) {
		const allTickets = await db.select().from(tickets);
		return c.json(allTickets);
	},

	async getTicket(c: Context) {
		const id = Number(c.req.param("id"));
		const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));

		if (!ticket) {
			return c.json({ error: "Ticket not found" }, 404);
		}

		return c.json(ticket);
	},

	async postTicket(c: Context) {
		const body = await c.req.json();
		const [ticket] = await db
			.insert(tickets)
			.values({
				workspaceId: 1, // TODO: Get from context
				title: body.title,
				description: body.description,
			})
			.returning();

		return c.json(ticket, 201);
	},

	async patchTicket(c: Context) {
		const id = Number(c.req.param("id"));
		const body = await c.req.json();

		const [ticket] = await db
			.update(tickets)
			.set({
				...body,
				updatedAt: new Date(),
			})
			.where(eq(tickets.id, id))
			.returning();

		if (!ticket) {
			return c.json({ error: "Ticket not found" }, 404);
		}

		return c.json(ticket);
	},

	async deleteTicket(c: Context) {
		const id = Number(c.req.param("id"));
		await db.delete(tickets).where(eq(tickets.id, id));
		return c.json({ success: true });
	},
};
