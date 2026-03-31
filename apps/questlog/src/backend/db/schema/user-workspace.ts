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
    // RLS policy - users can only see their own workspace associations
    // during the authenticated session
    pgPolicy("user_workspaces_workspace_isolation", {
      as: "permissive",
      for: "all",
      to: "public",
      using: sql`${table.workspaceId} = current_setting('app.current_workspace_id', true)::integer`,
      withCheck: sql`${table.workspaceId} = current_setting('app.current_workspace_id', true)::integer`,
    }),
  ],
);
