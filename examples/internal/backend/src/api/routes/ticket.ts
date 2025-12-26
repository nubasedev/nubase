import { createHttpHandler, HttpError } from "@nubase/backend";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { apiEndpoints } from "questlog-schema";
import type { QuestlogUser } from "../../auth";
import { getDb } from "../../db/helpers/drizzle";
import { ticketsTable } from "../../db/schema/ticket";
import type { Workspace } from "../../middleware/workspace-middleware";

// Type-safe database types inferred from schema
type Ticket = InferSelectModel<typeof ticketsTable>;
type NewTicket = InferInsertModel<typeof ticketsTable>;

/**
 * Ticket CRUD endpoints.
 */
export const ticketHandlers = {
  /** Get all tickets - workspace-scoped. */
  getTickets: createHttpHandler<
    typeof apiEndpoints.getTickets,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.getTickets,
    auth: "required",
    handler: async ({ user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.username} fetching tickets for workspace ${workspace.slug}`,
      );
      const db = getDb();
      const tickets: Ticket[] = await db
        .select()
        .from(ticketsTable)
        .where(eq(ticketsTable.workspaceId, workspace.id));

      return tickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description ?? undefined,
      }));
    },
  }),

  /** Get a single ticket - workspace-scoped. */
  getTicket: createHttpHandler<
    typeof apiEndpoints.getTicket,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.getTicket,
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.username} fetching ticket ${params.id} for workspace ${workspace.slug}`,
      );
      const db = getDb();
      const tickets: Ticket[] = await db
        .select()
        .from(ticketsTable)
        .where(
          and(
            eq(ticketsTable.id, params.id),
            eq(ticketsTable.workspaceId, workspace.id),
          ),
        );

      if (tickets.length === 0) {
        throw new HttpError(404, "Ticket not found");
      }

      const ticket: Ticket = tickets[0];
      return {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description ?? undefined,
      };
    },
  }),

  /** Create a new ticket - workspace-scoped. */
  postTicket: createHttpHandler<
    typeof apiEndpoints.postTicket,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.postTicket,
    auth: "required",
    handler: async ({ body, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.username} creating ticket for workspace ${workspace.slug}:`,
        body,
      );
      const db = getDb();

      const insertData: NewTicket = {
        workspaceId: workspace.id,
        title: body.title,
        description: body.description,
      };

      const result: Ticket[] = await db
        .insert(ticketsTable)
        .values(insertData)
        .returning();

      if (result.length === 0) {
        throw new HttpError(500, "Failed to create ticket");
      }

      const createdTicket: Ticket = result[0];
      return {
        id: createdTicket.id,
        title: createdTicket.title,
        description: createdTicket.description ?? undefined,
      };
    },
  }),

  /** Update a ticket - workspace-scoped. */
  patchTicket: createHttpHandler<
    typeof apiEndpoints.patchTicket,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.patchTicket,
    auth: "required",
    handler: async ({ params, body, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.username} updating ticket ${params.id} for workspace ${workspace.slug}:`,
        body,
      );
      const db = getDb();

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
            eq(ticketsTable.workspaceId, workspace.id),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new HttpError(404, "Ticket not found");
      }

      const updatedTicket: Ticket = result[0];
      return {
        id: updatedTicket.id,
        title: updatedTicket.title,
        description: updatedTicket.description ?? undefined,
      };
    },
  }),

  /** Delete a ticket - workspace-scoped. */
  deleteTicket: createHttpHandler<
    typeof apiEndpoints.deleteTicket,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.deleteTicket,
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.username} deleting ticket ${params.id} for workspace ${workspace.slug}`,
      );
      const db = getDb();

      const result: Ticket[] = await db
        .delete(ticketsTable)
        .where(
          and(
            eq(ticketsTable.id, params.id),
            eq(ticketsTable.workspaceId, workspace.id),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new HttpError(404, "Ticket not found");
      }

      return { success: true };
    },
  }),
};
