import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const appDeploymentsTable = pgTable("app_deployments", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  version: integer("version").notNull().default(1),
  schemaVersion: varchar("schema_version", { length: 64 }).notNull(),
  bundle: text("bundle").notNull(),
  sourceMap: text("source_map"),
  manifest: jsonb("manifest").notNull().default({}),
  checksum: varchar("checksum", { length: 64 }).notNull(),
  isActive: boolean("is_active").notNull().default(false),
  deployedBy: integer("deployed_by").notNull(),
  deployedAt: timestamp("deployed_at").defaultNow(),
});
