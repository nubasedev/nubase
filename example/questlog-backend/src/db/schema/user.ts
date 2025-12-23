import { sql } from "drizzle-orm";
import {
  integer,
  pgPolicy,
  pgTable,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenant";

export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenantsTable.id),
    email: varchar("email", { length: 255 }).notNull(),
    username: varchar("username", { length: 100 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    unique("users_tenant_email_unique").on(table.tenantId, table.email),
    unique("users_tenant_username_unique").on(table.tenantId, table.username),
    // RLS policy for multi-tenant isolation
    // Only allow access to rows where tenant_id matches the current session's tenant
    pgPolicy("users_tenant_isolation", {
      as: "permissive",
      for: "all",
      to: "public",
      using: sql`${table.tenantId} = current_setting('app.current_tenant_id', true)::integer`,
      withCheck: sql`${table.tenantId} = current_setting('app.current_tenant_id', true)::integer`,
    }),
  ],
);
