import { createHttpHandler, HttpError } from "@nubase/backend";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq, ilike, or } from "drizzle-orm";
import { apiEndpoints } from "questlog-schema";
import type { QuestlogUser } from "../../auth";
import { getDb } from "../../db/helpers/drizzle";
import { usersTable } from "../../db/schema/user";
import { userWorkspacesTable } from "../../db/schema/user-workspace";
import type { Workspace } from "../../middleware/workspace-middleware";

// Type-safe database types inferred from schema
type User = InferSelectModel<typeof usersTable>;
type NewUser = InferInsertModel<typeof usersTable>;

/**
 * User CRUD endpoints.
 * Users are scoped to workspace via user_workspaces junction table.
 */
export const userHandlers = {
  /** Get all users in the current workspace. */
  getUsers: createHttpHandler<
    typeof apiEndpoints.getUsers,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.getUsers,
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} fetching users for workspace ${workspace.slug}`,
      );
      const db = getDb();

      // Build where conditions
      const conditions = [eq(userWorkspacesTable.workspaceId, workspace.id)];

      // Global text search - OR across searchable text fields
      if (params.q) {
        const searchTerm = `%${params.q}%`;
        const searchCondition = or(
          ilike(usersTable.displayName, searchTerm),
          ilike(usersTable.email, searchTerm),
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      // Filter by displayName if provided (case-insensitive partial match)
      if (params.displayName) {
        conditions.push(
          ilike(usersTable.displayName, `%${params.displayName}%`),
        );
      }

      // Filter by email if provided (case-insensitive partial match)
      if (params.email) {
        conditions.push(ilike(usersTable.email, `%${params.email}%`));
      }

      // Get users that belong to this workspace via junction table
      const users = await db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          displayName: usersTable.displayName,
        })
        .from(usersTable)
        .innerJoin(
          userWorkspacesTable,
          eq(usersTable.id, userWorkspacesTable.userId),
        )
        .where(and(...conditions));

      return users;
    },
  }),

  /** Get a single user - must belong to current workspace. */
  getUser: createHttpHandler<
    typeof apiEndpoints.getUser,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.getUser,
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} fetching user ${params.id} for workspace ${workspace.slug}`,
      );
      const db = getDb();

      // Get user if they belong to this workspace
      const users = await db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          displayName: usersTable.displayName,
        })
        .from(usersTable)
        .innerJoin(
          userWorkspacesTable,
          eq(usersTable.id, userWorkspacesTable.userId),
        )
        .where(
          and(
            eq(usersTable.id, params.id),
            eq(userWorkspacesTable.workspaceId, workspace.id),
          ),
        );

      if (users.length === 0) {
        throw new HttpError(404, "User not found");
      }

      return users[0];
    },
  }),

  /** Create a new user and add to current workspace. */
  postUser: createHttpHandler<
    typeof apiEndpoints.postUser,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.postUser,
    auth: "required",
    handler: async ({ body, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} creating user for workspace ${workspace.slug}:`,
        body,
      );
      const db = getDb();

      // Check if user with this email already exists
      const existingUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, body.email));

      let createdUser: User;

      if (existingUsers.length > 0) {
        // User exists - add them to this workspace if not already a member
        createdUser = existingUsers[0];

        const existingMembership = await db
          .select()
          .from(userWorkspacesTable)
          .where(
            and(
              eq(userWorkspacesTable.userId, createdUser.id),
              eq(userWorkspacesTable.workspaceId, workspace.id),
            ),
          );

        if (existingMembership.length > 0) {
          throw new HttpError(
            409,
            "User is already a member of this workspace",
          );
        }
      } else {
        // Create new user (with a placeholder password hash - in real app, send invite email)
        const insertData: NewUser = {
          email: body.email,
          displayName: body.displayName,
          passwordHash: "placeholder-requires-password-reset",
        };

        const result = await db
          .insert(usersTable)
          .values(insertData)
          .returning();

        if (result.length === 0) {
          throw new HttpError(500, "Failed to create user");
        }

        createdUser = result[0];
      }

      // Add user to workspace
      await db.insert(userWorkspacesTable).values({
        userId: createdUser.id,
        workspaceId: workspace.id,
      });

      return {
        id: createdUser.id,
        email: createdUser.email,
        displayName: createdUser.displayName,
      };
    },
  }),

  /** Update a user - must belong to current workspace. */
  patchUser: createHttpHandler<
    typeof apiEndpoints.patchUser,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.patchUser,
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
        .select()
        .from(userWorkspacesTable)
        .where(
          and(
            eq(userWorkspacesTable.userId, params.id),
            eq(userWorkspacesTable.workspaceId, workspace.id),
          ),
        );

      if (membership.length === 0) {
        throw new HttpError(404, "User not found in this workspace");
      }

      const updateData: Partial<NewUser> = {};
      if (body.email !== undefined) {
        updateData.email = body.email;
      }
      if (body.displayName !== undefined) {
        updateData.displayName = body.displayName;
      }

      const result = await db
        .update(usersTable)
        .set(updateData)
        .where(eq(usersTable.id, params.id))
        .returning();

      if (result.length === 0) {
        throw new HttpError(404, "User not found");
      }

      const updatedUser = result[0];
      return {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
      };
    },
  }),

  /** Remove a user from current workspace. */
  deleteUser: createHttpHandler<
    typeof apiEndpoints.deleteUser,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.deleteUser,
    auth: "required",
    handler: async ({ params, user, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      console.log(
        `User ${user.email} removing user ${params.id} from workspace ${workspace.slug}`,
      );
      const db = getDb();

      // Remove user from workspace (don't delete the user account itself)
      const result = await db
        .delete(userWorkspacesTable)
        .where(
          and(
            eq(userWorkspacesTable.userId, params.id),
            eq(userWorkspacesTable.workspaceId, workspace.id),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new HttpError(404, "User not found in this workspace");
      }

      return { success: true };
    },
  }),

  /** Lookup users for select/autocomplete fields. */
  lookupUsers: createHttpHandler<
    typeof apiEndpoints.lookupUsers,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.lookupUsers,
    auth: "required",
    handler: async ({ params, ctx }) => {
      const workspace = ctx.get("workspace") as Workspace;
      const db = getDb();

      // Build where conditions
      const conditions = [eq(userWorkspacesTable.workspaceId, workspace.id)];

      // Filter by query if provided (case-insensitive partial match on displayName or email)
      if (params.q) {
        conditions.push(ilike(usersTable.displayName, `%${params.q}%`));
      }

      // Get users that belong to this workspace via junction table
      const users = await db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          displayName: usersTable.displayName,
        })
        .from(usersTable)
        .innerJoin(
          userWorkspacesTable,
          eq(usersTable.id, userWorkspacesTable.userId),
        )
        .where(and(...conditions))
        .limit(20);

      // Transform to Lookup format
      return users.map((u) => ({
        id: u.id,
        title: u.displayName,
        subtitle: u.email,
        // image: u.avatarUrl, // Add if you have avatar URLs
      }));
    },
  }),
};
