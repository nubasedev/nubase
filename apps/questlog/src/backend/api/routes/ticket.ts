import { HttpError } from "@nubase/backend";
import { deleteTicket as deleteTicketSql } from "../../data-layer/tickets/deleteTicket";
import { getTicket as getTicketSql } from "../../data-layer/tickets/getTicket";
import { insertTicket as insertTicketSql } from "../../data-layer/tickets/insertTicket";
import { listTickets as listTicketsSql } from "../../data-layer/tickets/listTickets";
import { updateTicket as updateTicketSql } from "../../data-layer/tickets/updateTicket";
import { getPgClient } from "../../db/helpers/drizzle";
import type { Workspace } from "../../middleware/workspace-middleware";
import { createHandler } from "../handler-factory";

/**
 * Ticket CRUD endpoints, powered by Typed SQL generated wrappers.
 * This file is intentionally the first full Typed-SQL conversion — see the
 * commit message for the ergonomic findings surfaced while writing it.
 *
 * All the `as unknown as` casts below are unavoidable until Typed SQL
 * tracks param nullability; they're documented as the "null sentinel"
 * rough edge.
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
      const db = getPgClient();

      // Normalize the scalar-or-array assigneeId filter to an array (or
      // null when absent/empty). An empty array means "no filter" to match
      // the old Drizzle behavior.
      const assigneeIds: number[] | null = (() => {
        if (params.assigneeId === undefined) return null;
        if (Array.isArray(params.assigneeId)) {
          return params.assigneeId.length > 0 ? params.assigneeId : null;
        }
        return [params.assigneeId];
      })();

      const rows = await listTicketsSql(db, {
        workspace_id: workspace.id,
        // Typed SQL doesn't track param nullability, so we cast `null`
        // through the non-null param type. The SQL uses `$N::text IS NULL`
        // as a short-circuit, so the value is only consulted when present.
        q: params.q ? `%${params.q}%` : (null as unknown as string),
        title: params.title ? `%${params.title}%` : (null as unknown as string),
        description: params.description
          ? `%${params.description}%`
          : (null as unknown as string),
        assignee_ids: assigneeIds as unknown as number[],
      });

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        assigneeId: row.assignee_id ?? undefined,
        // LEFT JOIN nullability caveat: the generated types say `string`
        // (not `string | null`) for these fields, because pg_attribute
        // reports the *source column* as NOT NULL. At runtime they're
        // actually `string | null` when the join misses, so we have to
        // coerce them here — TypeScript thinks the `?? undefined` is a
        // no-op, but it isn't.
        assigneeName: (row.assignee_name as string | null) ?? undefined,
        assigneeEmail: (row.assignee_email as string | null) ?? undefined,
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
      const db = getPgClient();

      const rows = await getTicketSql(db, {
        id: params.id,
        workspace_id: workspace.id,
      });

      const row = rows[0];
      if (!row) {
        throw new HttpError(404, "Ticket not found");
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        assigneeId: row.assignee_id ?? undefined,
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
      const db = getPgClient();

      const rows = await insertTicketSql(db, {
        workspace_id: workspace.id,
        title: body.title,
        // description/assignee_id are nullable columns, but the generated
        // param types are non-null. Casting `null` through preserves the
        // correct runtime semantics — Postgres accepts NULL for a nullable
        // column regardless of what TypeScript thinks.
        description: (body.description ?? null) as unknown as string,
        assignee_id: (body.assigneeId ?? null) as unknown as number,
      });

      const row = rows[0];
      if (!row) {
        throw new HttpError(500, "Failed to create ticket");
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        assigneeId: row.assignee_id ?? undefined,
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
      const db = getPgClient();

      // Partial-update with CASE WHEN flags. For each field: pass an
      // update_X flag plus the value (or a dummy when not updating).
      // When the flag is false, the SQL's ELSE branch keeps the original
      // column, so the dummy value is discarded — but TypeScript still
      // demands a well-typed placeholder. See commit message for the
      // full "dummy value" rough edge.
      const rows = await updateTicketSql(db, {
        id: params.id,
        workspace_id: workspace.id,
        update_title: body.title !== undefined,
        title: body.title ?? "",
        update_description: body.description !== undefined,
        // body.description may be `null` legitimately (set-to-null) —
        // the runtime works, TypeScript has to look the other way.
        description: (body.description ?? "") as unknown as string,
        update_assignee_id: body.assigneeId !== undefined,
        assignee_id: (body.assigneeId ?? 0) as unknown as number,
      });

      const row = rows[0];
      if (!row) {
        throw new HttpError(404, "Ticket not found");
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        assigneeId: row.assignee_id ?? undefined,
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
      const db = getPgClient();

      const rows = await deleteTicketSql(db, {
        id: params.id,
        workspace_id: workspace.id,
      });

      if (rows.length === 0) {
        throw new HttpError(404, "Ticket not found");
      }

      return { success: true };
    },
  }),
};
