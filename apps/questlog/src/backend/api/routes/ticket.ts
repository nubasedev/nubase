import { HttpError } from "@nubase/backend";
import { getDb } from "../../db/helpers/kysely";
import type { Workspace } from "../../middleware/workspace-middleware";
import { createHandler } from "../handler-factory";

/**
 * Ticket CRUD endpoints.
 */
export const ticketHandlers = {
  /** Get all tickets - workspace-scoped with optional filters. */
  getTickets: createHandler((e) => e.getTickets, {
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} fetching tickets for workspace ${workspace.slug}`,
        params,
      );
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
        ])
        .where("tickets.workspaceId", "=", workspace.id);

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

      const tickets = await query.execute();

      return tickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description ?? undefined,
        assigneeId: ticket.assigneeId ?? undefined,
        assigneeName: ticket.assigneeName ?? undefined,
        assigneeEmail: ticket.assigneeEmail ?? undefined,
      }));
    },
  }),

  /** Get a single ticket - workspace-scoped. */
  getTicket: createHandler((e) => e.getTicket, {
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} fetching ticket ${params.id} for workspace ${workspace.slug}`,
      );
      const db = getDb();
      const ticket = await db
        .selectFrom("tickets")
        .selectAll()
        .where("id", "=", params.id)
        .where("workspaceId", "=", workspace.id)
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

  /** Create a new ticket - workspace-scoped. */
  postTicket: createHandler((e) => e.postTicket, {
    auth: "required",
    handler: async ({ body, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} creating ticket for workspace ${workspace.slug}:`,
        body,
      );
      const db = getDb();

      const createdTicket = await db
        .insertInto("tickets")
        .values({
          workspaceId: workspace.id,
          title: body.title,
          description: body.description,
          assigneeId: body.assigneeId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return {
        id: createdTicket.id,
        title: createdTicket.title,
        description: createdTicket.description ?? undefined,
        assigneeId: createdTicket.assigneeId ?? undefined,
      };
    },
  }),

  /** Update a ticket - workspace-scoped. */
  patchTicket: createHandler((e) => e.patchTicket, {
    auth: "required",
    handler: async ({ params, body, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} updating ticket ${params.id} for workspace ${workspace.slug}:`,
        body,
      );
      const db = getDb();

      const updateData: Record<string, unknown> = {};
      if (body.title !== undefined) {
        updateData.title = body.title;
      }
      if (body.description !== undefined) {
        updateData.description = body.description;
      }
      if (body.assigneeId !== undefined) {
        updateData.assigneeId = body.assigneeId;
      }

      const updatedTicket = await db
        .updateTable("tickets")
        .set(updateData)
        .where("id", "=", params.id)
        .where("workspaceId", "=", workspace.id)
        .returningAll()
        .executeTakeFirst();

      if (!updatedTicket) {
        throw new HttpError(404, "Ticket not found");
      }

      return {
        id: updatedTicket.id,
        title: updatedTicket.title,
        description: updatedTicket.description ?? undefined,
        assigneeId: updatedTicket.assigneeId ?? undefined,
      };
    },
  }),

  /** Delete a ticket - workspace-scoped. */
  deleteTicket: createHandler((e) => e.deleteTicket, {
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} deleting ticket ${params.id} for workspace ${workspace.slug}`,
      );
      const db = getDb();

      const deleted = await db
        .deleteFrom("tickets")
        .where("id", "=", params.id)
        .where("workspaceId", "=", workspace.id)
        .returningAll()
        .executeTakeFirst();

      if (!deleted) {
        throw new HttpError(404, "Ticket not found");
      }

      return { success: true };
    },
  }),
};
