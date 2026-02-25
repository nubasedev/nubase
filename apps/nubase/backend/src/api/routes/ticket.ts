import { HttpError } from "@nubase/backend";
import type { InferInsertModel, InferSelectModel, SQL } from "drizzle-orm";
import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { getDataDb, getDb } from "../../db/helpers/drizzle";
import { ticketsTable } from "../../db/schema/ticket";
import { usersTable } from "../../db/schema/user";
import type { Workspace } from "../../middleware/workspace-middleware";
import { createHandler } from "../handler-factory";

// Type-safe database types inferred from schema
type Ticket = InferSelectModel<typeof ticketsTable>;
type NewTicket = InferInsertModel<typeof ticketsTable>;

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
      const dataDb = getDataDb();

      // Build filter conditions
      const conditions: SQL[] = [eq(ticketsTable.workspaceId, workspace.id)];

      // Global text search - OR across searchable text fields
      if (params.q) {
        const searchTerm = `%${params.q}%`;
        const searchCondition = or(
          ilike(ticketsTable.title, searchTerm),
          ilike(ticketsTable.description, searchTerm),
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      // Filter by title (case-insensitive partial match)
      if (params.title) {
        conditions.push(ilike(ticketsTable.title, `%${params.title}%`));
      }

      // Filter by description (case-insensitive partial match)
      if (params.description) {
        conditions.push(
          ilike(ticketsTable.description, `%${params.description}%`),
        );
      }

      // Filter by assigneeEmail (supports single value or array for multi-select)
      if (params.assigneeEmail !== undefined) {
        if (Array.isArray(params.assigneeEmail)) {
          if (params.assigneeEmail.length > 0) {
            conditions.push(
              inArray(ticketsTable.assigneeEmail, params.assigneeEmail),
            );
          }
        } else {
          conditions.push(eq(ticketsTable.assigneeEmail, params.assigneeEmail));
        }
      }

      // Query tickets from data_db
      const tickets = await dataDb
        .select()
        .from(ticketsTable)
        .where(and(...conditions));

      // Collect unique assignee emails for cross-db lookup
      const assigneeEmails = [
        ...new Set(
          tickets
            .map((t) => t.assigneeEmail)
            .filter((email): email is string => email !== null),
        ),
      ];

      // Query users from nubase_db by email
      let usersMap = new Map<string, { displayName: string }>();
      if (assigneeEmails.length > 0) {
        const db = getDb();
        const users = await db
          .select({
            displayName: usersTable.displayName,
            email: usersTable.email,
          })
          .from(usersTable)
          .where(inArray(usersTable.email, assigneeEmails));

        usersMap = new Map(
          users.map((u) => [u.email, { displayName: u.displayName }]),
        );
      }

      // Merge results in JS
      return tickets.map((ticket) => {
        const assignee = ticket.assigneeEmail
          ? usersMap.get(ticket.assigneeEmail)
          : undefined;
        return {
          id: ticket.id,
          title: ticket.title,
          description: ticket.description ?? undefined,
          assigneeEmail: ticket.assigneeEmail ?? undefined,
          assigneeName: assignee?.displayName ?? undefined,
        };
      });
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
      const dataDb = getDataDb();
      const tickets: Ticket[] = await dataDb
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
        assigneeEmail: ticket.assigneeEmail ?? undefined,
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
      const dataDb = getDataDb();

      const insertData: NewTicket = {
        workspaceId: workspace.id,
        title: body.title,
        description: body.description,
        assigneeEmail: body.assigneeEmail,
      };

      const result: Ticket[] = await dataDb
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
        assigneeEmail: createdTicket.assigneeEmail ?? undefined,
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
      const dataDb = getDataDb();

      const updateData: Partial<NewTicket> = {};
      if (body.title !== undefined) {
        updateData.title = body.title;
      }
      if (body.description !== undefined) {
        updateData.description = body.description;
      }
      if (body.assigneeEmail !== undefined) {
        updateData.assigneeEmail = body.assigneeEmail;
      }

      const result: Ticket[] = await dataDb
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
        assigneeEmail: updatedTicket.assigneeEmail ?? undefined,
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
      const dataDb = getDataDb();

      const result: Ticket[] = await dataDb
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
