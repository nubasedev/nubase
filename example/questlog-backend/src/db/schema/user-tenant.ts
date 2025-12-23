import { sql } from "drizzle-orm";
import {
  integer,
  pgPolicy,
  pgTable,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenant";
import { usersTable } from "./user";

/**
 * Association table that links users to tenants.
 * A user can belong to multiple tenants.
 * This table has RLS to ensure users can only see their own tenant associations.
 */
export const userTenantsTable = pgTable(
  "user_tenants",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenantsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.tenantId] }),
    // RLS policy - users can only see their own tenant associations
    // during the authenticated session
    pgPolicy("user_tenants_tenant_isolation", {
      as: "permissive",
      for: "all",
      to: "public",
      using: sql`${table.tenantId} = current_setting('app.current_tenant_id', true)::integer`,
      withCheck: sql`${table.tenantId} = current_setting('app.current_tenant_id', true)::integer`,
    }),
  ],
);
