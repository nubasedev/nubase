import { createHttpHandler } from "@nubase/backend";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { apiEndpoints } from "questlog-schema";
import type { QuestlogUser } from "../../auth";
import { getDb } from "../../db/helpers/drizzle";
import { ticketsTable } from "../../db/schema/ticket";

// Type-safe database types inferred from schema
type Ticket = InferSelectModel<typeof ticketsTable>;
type NewTicket = InferInsertModel<typeof ticketsTable>;

/**
 * Get all tickets - requires authentication.
 */
export const handleGetTickets = createHttpHandler<
  typeof apiEndpoints.getTickets,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.getTickets,
  auth: "required",
  handler: async ({ user }) => {
    console.log(`User ${user.username} fetching tickets`);
    const db = getDb();
    const tickets: Ticket[] = await db.select().from(ticketsTable);

    // Transform database result to match API schema
    return tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description ?? undefined,
    }));
  },
});

/**
 * Get a single ticket - requires authentication.
 */
export const handleGetTicket = createHttpHandler<
  typeof apiEndpoints.getTicket,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.getTicket,
  auth: "required",
  handler: async ({ params, user }) => {
    console.log(`User ${user.username} fetching ticket ${params.id}`);
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

/**
 * Create a new ticket - requires authentication.
 */
export const handlePostTicket = createHttpHandler<
  typeof apiEndpoints.postTicket,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.postTicket,
  auth: "required",
  handler: async ({ body, user }) => {
    console.log(`User ${user.username} creating ticket:`, body);
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

/**
 * Update a ticket - requires authentication.
 */
export const handlePatchTicket = createHttpHandler<
  typeof apiEndpoints.patchTicket,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.patchTicket,
  auth: "required",
  handler: async ({ params, body, user }) => {
    console.log(`User ${user.username} updating ticket ${params.id}:`, body);
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

/**
 * Delete a ticket - requires authentication.
 */
export const handleDeleteTicket = createHttpHandler<
  typeof apiEndpoints.deleteTicket,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.deleteTicket,
  auth: "required",
  handler: async ({ params, user }) => {
    console.log(`User ${user.username} deleting ticket ${params.id}`);
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
