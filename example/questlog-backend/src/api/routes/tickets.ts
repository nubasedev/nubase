import { createHttpHandler } from "@nubase/backend";
import { eq } from "drizzle-orm";
import { apiEndpoints } from "questlog-schema";
import { getDb } from "../../db/helpers/drizzle";
import { ticketsTable } from "../../db/schema/tickets";

export const handleGetTickets = createHttpHandler({
  endpoint: apiEndpoints.getTickets,
  handler: async ({ params, body, ctx }) => {
    const db = getDb();
    const tickets = await db.select().from(ticketsTable);
    console.log("Fetched tickets:", tickets);

    // Transform database result to match schema
    return tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
    }));
  },
});

export const handleGetTicketById = createHttpHandler({
  endpoint: apiEndpoints.getTicket,
  handler: async ({ params, body, ctx }) => {
    const db = getDb();
    const tickets = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, params.id));

    if (tickets.length === 0) {
      throw new Error("Ticket not found");
    }

    const ticket = tickets[0];
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description ?? undefined,
    };
  },
});

export const handlePostTicket = createHttpHandler({
  endpoint: apiEndpoints.postTicket,
  handler: async ({ params, body, ctx }) => {
    console.log("Received ticket data:", body);
    const db = getDb();

    const insertData = {
      title: body.title,
      description: body.description,
    };

    const result = await db.insert(ticketsTable).values(insertData).returning();

    if (result.length === 0) {
      throw new Error("Failed to create ticket");
    }

    const createdTicket = result[0];
    return {
      id: createdTicket.id,
      title: createdTicket.title,
      description: createdTicket.description ?? undefined,
    };
  },
});

export const handlePutTicket = createHttpHandler({
  endpoint: apiEndpoints.putTicket,
  handler: async ({ params, body, ctx }) => {
    const db = getDb();

    const updateData = {
      title: body.title,
      description: body.description || null,
    };

    const result = await db
      .update(ticketsTable)
      .set(updateData)
      .where(eq(ticketsTable.id, params.id))
      .returning();

    if (result.length === 0) {
      throw new Error("Ticket not found");
    }

    const updatedTicket = result[0];
    return {
      id: updatedTicket.id,
      title: updatedTicket.title,
      description: updatedTicket.description ?? undefined,
    };
  },
});

export const handleDeleteTicket = createHttpHandler({
  endpoint: apiEndpoints.deleteTicket,
  handler: async ({ params, body, ctx }) => {
    const db = getDb();

    const result = await db
      .delete(ticketsTable)
      .where(eq(ticketsTable.id, params.id))
      .returning();

    if (result.length === 0) {
      throw new Error("Ticket not found");
    }

    return { success: true };
  },
});
