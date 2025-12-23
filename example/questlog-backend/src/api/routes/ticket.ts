import { createHttpHandler } from "@nubase/backend";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { apiEndpoints } from "questlog-schema";
import type { QuestlogUser } from "../../auth";
import { getDb } from "../../db/helpers/drizzle";
import { ticketsTable } from "../../db/schema/ticket";
import type { Tenant } from "../../middleware/tenant-middleware";

// Type-safe database types inferred from schema
type Ticket = InferSelectModel<typeof ticketsTable>;
type NewTicket = InferInsertModel<typeof ticketsTable>;

/**
 * Get all tickets - requires authentication.
 * Now tenant-scoped: only returns tickets belonging to the current tenant.
 */
export const handleGetTickets = createHttpHandler<
  typeof apiEndpoints.getTickets,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.getTickets,
  auth: "required",
  handler: async ({ user, ctx }) => {
    const tenant = ctx.get("tenant") as Tenant;
    console.log(
      `User ${user.username} fetching tickets for tenant ${tenant.slug}`,
    );
    const db = getDb();
    const tickets: Ticket[] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.tenantId, tenant.id));

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
 * Now tenant-scoped: only returns ticket if it belongs to the current tenant.
 */
export const handleGetTicket = createHttpHandler<
  typeof apiEndpoints.getTicket,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.getTicket,
  auth: "required",
  handler: async ({ params, user, ctx }) => {
    const tenant = ctx.get("tenant") as Tenant;
    console.log(
      `User ${user.username} fetching ticket ${params.id} for tenant ${tenant.slug}`,
    );
    const db = getDb();
    const tickets: Ticket[] = await db
      .select()
      .from(ticketsTable)
      .where(
        and(
          eq(ticketsTable.id, params.id),
          eq(ticketsTable.tenantId, tenant.id),
        ),
      );

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
 * Now tenant-scoped: creates ticket for the current tenant.
 */
export const handlePostTicket = createHttpHandler<
  typeof apiEndpoints.postTicket,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.postTicket,
  auth: "required",
  handler: async ({ body, user, ctx }) => {
    const tenant = ctx.get("tenant") as Tenant;
    console.log(
      `User ${user.username} creating ticket for tenant ${tenant.slug}:`,
      body,
    );
    const db = getDb();

    // Type-safe insert data - includes tenantId
    const insertData: NewTicket = {
      tenantId: tenant.id,
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
 * Now tenant-scoped: only updates ticket if it belongs to the current tenant.
 */
export const handlePatchTicket = createHttpHandler<
  typeof apiEndpoints.patchTicket,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.patchTicket,
  auth: "required",
  handler: async ({ params, body, user, ctx }) => {
    const tenant = ctx.get("tenant") as Tenant;
    console.log(
      `User ${user.username} updating ticket ${params.id} for tenant ${tenant.slug}:`,
      body,
    );
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
      .where(
        and(
          eq(ticketsTable.id, params.id),
          eq(ticketsTable.tenantId, tenant.id),
        ),
      )
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
 * Now tenant-scoped: only deletes ticket if it belongs to the current tenant.
 */
export const handleDeleteTicket = createHttpHandler<
  typeof apiEndpoints.deleteTicket,
  "required",
  QuestlogUser
>({
  endpoint: apiEndpoints.deleteTicket,
  auth: "required",
  handler: async ({ params, user, ctx }) => {
    const tenant = ctx.get("tenant") as Tenant;
    console.log(
      `User ${user.username} deleting ticket ${params.id} for tenant ${tenant.slug}`,
    );
    const db = getDb();

    const result: Ticket[] = await db
      .delete(ticketsTable)
      .where(
        and(
          eq(ticketsTable.id, params.id),
          eq(ticketsTable.tenantId, tenant.id),
        ),
      )
      .returning();

    if (result.length === 0) {
      throw new Error("Ticket not found");
    }

    return { success: true };
  },
});
