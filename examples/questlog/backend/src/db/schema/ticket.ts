import { sql } from "drizzle-orm";
import {
  integer,
  pgPolicy,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { workspacesTable } from "./workspace";

export const ticketsTable = pgTable(
  "tickets",
  {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id")
      .notNull()
      .references(() => workspacesTable.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }),
    assigneeId: integer("assignee_id").references(() => usersTable.id),
  },
  (table) => [
    // RLS policy for multi-workspace isolation
    // Only allow access to rows where workspace_id matches the current session's workspace
    pgPolicy("tickets_workspace_isolation", {
      as: "permissive",
      for: "all",
      to: "public",
      using: sql`${table.workspaceId} = current_setting('app.current_workspace_id', true)::integer`,
      withCheck: sql`${table.workspaceId} = current_setting('app.current_workspace_id', true)::integer`,
    }),
  ],
);
