import { sql } from "drizzle-orm";
import {
  integer,
  pgPolicy,
  pgTable,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { workspacesTable } from "./workspace";

/**
 * Association table that links users to workspaces.
 * A user can belong to multiple workspaces.
 * This table has RLS to ensure users can only see their own workspace associations.
 */
export const userWorkspacesTable = pgTable(
  "user_workspaces",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    workspaceId: integer("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.workspaceId] }),
    // RLS policy — users can only see their own workspace associations
    // during the authenticated session.
    // NOTE: currently dormant — the runtime DATABASE_URL connects as a superuser,
    // which bypasses RLS. Kept in place as scaffolding for the planned RLS revival.
    // Also note: once RLS is revived, this table may need to become RLS-exempt
    // entirely, because the login flow reads it *before* any workspace is selected
    // (can't rely on a workspace context that hasn't been set yet). See the TODO
    // block at the top of src/backend/db/helpers/drizzle.ts.
    pgPolicy("user_workspaces_workspace_isolation", {
      as: "permissive",
      for: "all",
      to: "public",
      using: sql`${table.workspaceId} = current_setting('app.current_workspace_id', true)::integer`,
      withCheck: sql`${table.workspaceId} = current_setting('app.current_workspace_id', true)::integer`,
    }),
  ],
);
