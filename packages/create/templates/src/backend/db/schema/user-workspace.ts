import { integer, pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";
import { workspaces } from "./workspace";

export const userWorkspaces = pgTable(
	"user_workspaces",
	{
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		workspaceId: integer("workspace_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.workspaceId] })],
);
