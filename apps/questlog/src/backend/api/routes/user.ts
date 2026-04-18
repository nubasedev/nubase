import { HttpError } from "@nubase/backend";
import { getDb } from "../../db/helpers/kysely";
import type { Workspace } from "../../middleware/workspace-middleware";
import { createHandler } from "../handler-factory";

/**
 * User CRUD endpoints.
 * Users are scoped to workspace via user_workspaces junction table.
 */
export const userHandlers = {
  /** Get all users in the current workspace. */
  getUsers: createHandler((e) => e.getUsers, {
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} fetching users for workspace ${workspace.slug}`,
      );
      const db = getDb();

      let query = db
        .selectFrom("users")
        .innerJoin("userWorkspaces", "users.id", "userWorkspaces.userId")
        .select(["users.id", "users.email", "users.displayName"])
        .where("userWorkspaces.workspaceId", "=", workspace.id);

      // Global text search - OR across searchable text fields
      if (params.q) {
        const searchTerm = `%${params.q}%`;
        query = query.where((eb) =>
          eb.or([
            eb("users.displayName", "ilike", searchTerm),
            eb("users.email", "ilike", searchTerm),
          ]),
        );
      }

      // Filter by displayName if provided (case-insensitive partial match)
      if (params.displayName) {
        query = query.where(
          "users.displayName",
          "ilike",
          `%${params.displayName}%`,
        );
      }

      // Filter by email if provided (case-insensitive partial match)
      if (params.email) {
        query = query.where("users.email", "ilike", `%${params.email}%`);
      }

      const users = await query.orderBy("users.id", "asc").execute();
      return users;
    },
  }),

  /** Get a single user - must belong to current workspace. */
  getUser: createHandler((e) => e.getUser, {
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} fetching user ${params.id} for workspace ${workspace.slug}`,
      );
      const db = getDb();

      const found = await db
        .selectFrom("users")
        .innerJoin("userWorkspaces", "users.id", "userWorkspaces.userId")
        .select(["users.id", "users.email", "users.displayName"])
        .where("users.id", "=", params.id)
        .where("userWorkspaces.workspaceId", "=", workspace.id)
        .executeTakeFirst();

      if (!found) {
        throw new HttpError(404, "User not found");
      }

      return found;
    },
  }),

  /** Create a new user and add to current workspace. */
  postUser: createHandler((e) => e.postUser, {
    auth: "required",
    handler: async ({ body, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} creating user for workspace ${workspace.slug}:`,
        body,
      );
      const db = getDb();

      // Check if user with this email already exists
      const existingUser = await db
        .selectFrom("users")
        .selectAll()
        .where("email", "=", body.email)
        .executeTakeFirst();

      let createdUser: Record<string, any>;

      if (existingUser) {
        // User exists - add them to this workspace if not already a member
        createdUser = existingUser;

        const existingMembership = await db
          .selectFrom("userWorkspaces")
          .selectAll()
          .where("userId", "=", createdUser.id)
          .where("workspaceId", "=", workspace.id)
          .executeTakeFirst();

        if (existingMembership) {
          throw new HttpError(
            409,
            "User is already a member of this workspace",
          );
        }
      } else {
        // Create new user (with a placeholder password hash - in real app, send invite email)
        createdUser = await db
          .insertInto("users")
          .values({
            email: body.email,
            displayName: body.displayName,
            passwordHash: "placeholder-requires-password-reset",
          })
          .returningAll()
          .executeTakeFirstOrThrow();
      }

      // Add user to workspace
      await db
        .insertInto("userWorkspaces")
        .values({
          userId: createdUser.id,
          workspaceId: workspace.id,
        })
        .execute();

      return {
        id: createdUser.id,
        email: createdUser.email,
        displayName: createdUser.displayName,
      };
    },
  }),

  /** Update a user - must belong to current workspace. */
  patchUser: createHandler((e) => e.patchUser, {
    auth: "required",
    handler: async ({ params, body, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} updating user ${params.id} for workspace ${workspace.slug}:`,
        body,
      );
      const db = getDb();

      // Verify user belongs to this workspace
      const membership = await db
        .selectFrom("userWorkspaces")
        .selectAll()
        .where("userId", "=", params.id)
        .where("workspaceId", "=", workspace.id)
        .executeTakeFirst();

      if (!membership) {
        throw new HttpError(404, "User not found in this workspace");
      }

      const updateData: Record<string, unknown> = {};
      if (body.email !== undefined) {
        updateData.email = body.email;
      }
      if (body.displayName !== undefined) {
        updateData.displayName = body.displayName;
      }

      const updatedUser = await db
        .updateTable("users")
        .set(updateData)
        .where("id", "=", params.id)
        .returningAll()
        .executeTakeFirst();

      if (!updatedUser) {
        throw new HttpError(404, "User not found");
      }

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
      };
    },
  }),

  /** Remove a user from current workspace. */
  deleteUser: createHandler((e) => e.deleteUser, {
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} removing user ${params.id} from workspace ${workspace.slug}`,
      );
      const db = getDb();

      // Remove user from workspace (don't delete the user account itself)
      const deleted = await db
        .deleteFrom("userWorkspaces")
        .where("userId", "=", params.id)
        .where("workspaceId", "=", workspace.id)
        .returningAll()
        .executeTakeFirst();

      if (!deleted) {
        throw new HttpError(404, "User not found in this workspace");
      }

      return { success: true };
    },
  }),

  /** Lookup users for select/autocomplete fields. */
  lookupUsers: createHandler((e) => e.lookupUsers, {
    auth: "required",
    handler: async ({ params, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      const db = getDb();

      let query = db
        .selectFrom("users")
        .innerJoin("userWorkspaces", "users.id", "userWorkspaces.userId")
        .select(["users.id", "users.email", "users.displayName"])
        .where("userWorkspaces.workspaceId", "=", workspace.id);

      // Filter by query if provided (case-insensitive partial match on displayName or email)
      if (params.q) {
        query = query.where("users.displayName", "ilike", `%${params.q}%`);
      }

      const users = await query.limit(20).execute();

      // Transform to Lookup format
      return users.map((u) => ({
        id: u.id,
        title: u.displayName,
        subtitle: u.email,
      }));
    },
  }),
};
