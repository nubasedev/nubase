import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Users table - stores user credentials at root level (no RLS).
 * Users can belong to multiple workspaces via the user_workspaces association table.
 * Authentication happens at root level, then user selects a workspace.
 */
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
