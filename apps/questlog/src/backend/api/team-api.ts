import { HttpError } from "@nubase/backend";
import { getDb } from "../db/helpers/kysely";
import type { Workspace } from "../middleware/workspace-middleware";
import { createHandler } from "./handler-factory";

/**
 * Team CRUD endpoints.
 * Teams are workspace-scoped via the workspace_id column.
 * Each user belongs to at most one team via users.team_id.
 */
export const teamHandlers = {
  /** Get all teams in the current workspace, with member counts. */
  getTeams: createHandler((e) => e.getTeams, {
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} fetching teams for workspace ${workspace.slug}`,
        params,
      );
      const db = getDb();

      let query = db
        .selectFrom("teams")
        .leftJoin("users", "users.teamId", "teams.id")
        .select((eb) => [
          "teams.id",
          "teams.name",
          "teams.description",
          eb.fn.count<string>("users.id").as("memberCount"),
        ])
        .where("teams.workspaceId", "=", workspace.id)
        .groupBy(["teams.id", "teams.name", "teams.description"]);

      // Global text search - OR across searchable text fields
      if (params.q) {
        const searchTerm = `%${params.q}%`;
        query = query.where((eb) =>
          eb.or([
            eb("teams.name", "ilike", searchTerm),
            eb("teams.description", "ilike", searchTerm),
          ]),
        );
      }

      if (params.name) {
        query = query.where("teams.name", "ilike", `%${params.name}%`);
      }

      if (params.description) {
        query = query.where(
          "teams.description",
          "ilike",
          `%${params.description}%`,
        );
      }

      const teams = await query.orderBy("teams.id", "asc").execute();

      return teams.map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description ?? undefined,
        memberCount: Number(team.memberCount),
      }));
    },
  }),

  /** Get a single team - workspace-scoped. */
  getTeam: createHandler((e) => e.getTeam, {
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} fetching team ${params.id} for workspace ${workspace.slug}`,
      );
      const db = getDb();

      const team = await db
        .selectFrom("teams")
        .selectAll()
        .where("id", "=", params.id)
        .where("workspaceId", "=", workspace.id)
        .executeTakeFirst();

      if (!team) {
        throw new HttpError(404, "Team not found");
      }

      return {
        id: team.id,
        name: team.name,
        description: team.description ?? undefined,
      };
    },
  }),

  /** Create a new team - workspace-scoped. */
  postTeam: createHandler((e) => e.postTeam, {
    auth: "required",
    handler: async ({ body, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} creating team for workspace ${workspace.slug}:`,
        body,
      );
      const db = getDb();

      const createdTeam = await db
        .insertInto("teams")
        .values({
          workspaceId: workspace.id,
          name: body.name,
          description: body.description,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return {
        id: createdTeam.id,
        name: createdTeam.name,
        description: createdTeam.description ?? undefined,
      };
    },
  }),

  /** Update a team - workspace-scoped. */
  patchTeam: createHandler((e) => e.patchTeam, {
    auth: "required",
    handler: async ({ params, body, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} updating team ${params.id} for workspace ${workspace.slug}:`,
        body,
      );
      const db = getDb();

      const updateData: Record<string, unknown> = {};
      if (body.name !== undefined) {
        updateData.name = body.name;
      }
      if (body.description !== undefined) {
        updateData.description = body.description;
      }

      const updatedTeam = await db
        .updateTable("teams")
        .set(updateData)
        .where("id", "=", params.id)
        .where("workspaceId", "=", workspace.id)
        .returningAll()
        .executeTakeFirst();

      if (!updatedTeam) {
        throw new HttpError(404, "Team not found");
      }

      return {
        id: updatedTeam.id,
        name: updatedTeam.name,
        description: updatedTeam.description ?? undefined,
      };
    },
  }),

  /** Delete a team - workspace-scoped. */
  deleteTeam: createHandler((e) => e.deleteTeam, {
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} deleting team ${params.id} for workspace ${workspace.slug}`,
      );
      const db = getDb();

      const deleted = await db
        .deleteFrom("teams")
        .where("id", "=", params.id)
        .where("workspaceId", "=", workspace.id)
        .returningAll()
        .executeTakeFirst();

      if (!deleted) {
        throw new HttpError(404, "Team not found");
      }

      return { success: true };
    },
  }),

  /** Lookup teams for select/autocomplete fields. */
  lookupTeams: createHandler((e) => e.lookupTeams, {
    auth: "required",
    handler: async ({ params, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      const db = getDb();

      let query = db
        .selectFrom("teams")
        .select(["teams.id", "teams.name", "teams.description"])
        .where("teams.workspaceId", "=", workspace.id);

      if (params.q) {
        query = query.where("teams.name", "ilike", `%${params.q}%`);
      }

      const teams = await query.limit(20).execute();

      return teams.map((t) => ({
        id: t.id,
        title: t.name,
        subtitle: t.description ?? undefined,
      }));
    },
  }),
};
