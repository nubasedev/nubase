import { createHttpHandler } from "@nubase/backend";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { apiEndpoints } from "questlog-schema";
import { getDb } from "../../db/helpers/drizzle";
import { ticketsTable } from "../../db/schema/ticket";

// Type-safe database types inferred from schema
type Ticket = InferSelectModel<typeof ticketsTable>;
type NewTicket = InferInsertModel<typeof ticketsTable>;

export const handleGetTickets = createHttpHandler({
  endpoint: apiEndpoints.getTickets,
  handler: async () => {
    const db = getDb();
    const tickets: Ticket[] = await db.select().from(ticketsTable);
    console.log("Fetched tickets:", tickets);

    // Transform database result to match API schema
    return tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description ?? undefined,
    }));
  },
});

export const handleGetTicket = createHttpHandler({
  endpoint: apiEndpoints.getTicket,
  handler: async ({ params }) => {
    const db = getDb();
    const tickets: Ticket[] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, params.id));

    if (tickets.length === 0) {
      throw new Error("Ticket not found");
    }

    const ticket: Ticket = tickets[0];
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description ?? undefined,
    };
  },
});

export const handlePostTicket = createHttpHandler({
  endpoint: apiEndpoints.postTicket,
  handler: async ({ body }) => {
    console.log("Received ticket data:", body);
    const db = getDb();

    // Type-safe insert data - only include fields that can be inserted
    const insertData: NewTicket = {
      title: body.title,
      description: body.description,
    };

    const result: Ticket[] = await db
      .insert(ticketsTable)
      .values(insertData)
      .returning();

    if (result.length === 0) {
      throw new Error("Failed to create ticket");
    }

    const createdTicket: Ticket = result[0];
    return {
      id: createdTicket.id,
      title: createdTicket.title,
      description: createdTicket.description ?? undefined,
    };
  },
});

export const handlePatchTicket = createHttpHandler({
  endpoint: apiEndpoints.patchTicket,
  handler: async ({ params, body }) => {
    const db = getDb();

    // Type-safe partial update - only include fields that exist and are not undefined
    const updateData: Partial<NewTicket> = {};
    if (body.title !== undefined) {
      updateData.title = body.title;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    const result: Ticket[] = await db
      .update(ticketsTable)
      .set(updateData)
      .where(eq(ticketsTable.id, params.id))
      .returning();

    if (result.length === 0) {
      throw new Error("Ticket not found");
    }

    const updatedTicket: Ticket = result[0];
    return {
      id: updatedTicket.id,
      title: updatedTicket.title,
      description: updatedTicket.description ?? undefined,
    };
  },
});

export const handleDeleteTicket = createHttpHandler({
  endpoint: apiEndpoints.deleteTicket,
  handler: async ({ params }) => {
    const db = getDb();

    const result: Ticket[] = await db
      .delete(ticketsTable)
      .where(eq(ticketsTable.id, params.id))
      .returning();

    if (result.length === 0) {
      throw new Error("Ticket not found");
    }

    return { success: true };
  },
});
