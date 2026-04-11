import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";

// =============================================================================
// WORKSPACE ISOLATION / RLS — CURRENT STATE (TODO: revisit)
// =============================================================================
//
// The codebase defines Postgres Row-Level Security policies on workspace-scoped
// tables (tickets, user_workspaces) and the middleware calls setWorkspaceContext
// on every authenticated request. The *intent* is that a bug forgetting to set
// the context would safe-fail to zero rows at the DB layer.
//
// In reality, RLS is currently NOT enforced. DATABASE_URL points at a superuser
// role, and Postgres superusers unconditionally bypass RLS. The policies still
// exist in the schema; they're just ornamental for this connection. Workspace
// isolation today relies entirely on app-layer correctness (routes filtering by
// workspaceId, middleware plumbing).
//
// This was a deliberate simplification — the previous design split DATABASE_URL
// (restricted) + DATABASE_URL_ADMIN (superuser) to enforce RLS at the DB layer,
// but the two-role model was removed for simplicity. We want DB-layer
// enforcement back eventually, without reintroducing a second role. The planned
// design is:
//
//   1. ALTER ROLE questlog NOSUPERUSER NOBYPASSRLS
//   2. ALTER TABLE <workspace-scoped> FORCE ROW LEVEL SECURITY (so the owner
//      doesn't bypass RLS either)
//   3. Keep root-level tables (users, workspaces, user_workspaces) with no RLS —
//      login flow needs to read them before any workspace is selected
//   4. Policies use NULLIF(current_setting(..., true), '')::integer so an unset
//      context produces NULL, which makes the predicate false → zero rows
//
// There are two things to fix at the same time, or isolation will be broken in
// a subtler way:
//
//   (a) CONCURRENCY BUG: setWorkspaceContext below calls set_config(..., false)
//       — session-level, not transaction-local — on a shared single pg.Client.
//       Two concurrent requests interleaving queries on that connection can see
//       each other's workspace_id. The fix is to wrap each request in
//       db.transaction() and use set_config(..., true) (SET LOCAL semantics), or
//       equivalently SET LOCAL app.current_workspace_id = .... This requires
//       plumbing the tx through the handler factory instead of using the module-
//       level global db.
//
//   (b) POOLING: this file uses a single long-lived pg.Client rather than a
//       pg.Pool. That masks (a) partially in dev but is not viable for real
//       workloads. A pool + SET LOCAL + transactions is the clean combination.
//
// Until the above is done, RLS-related code (this file's setWorkspaceContext/
// clearWorkspaceContext, the RLS policies in schema/ticket.ts and
// schema/user-workspace.ts, the middleware calls in workspace-middleware.ts) is
// kept in place as scaffolding — harmless, and it documents the intended shape
// for the future refactor.
// =============================================================================

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var db: NodePgDatabase | undefined;
}

/**
 * Get the database connection.
 */
export function getDb() {
  if (!global.db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not defined in the environment variables.",
      );
    }
    const databaseUrl = process.env.DATABASE_URL;
    const client = new Client({ connectionString: databaseUrl });
    client.connect().catch((err) => {
      console.error("Failed to connect to database:", err);
      throw err;
    });
    global.db = drizzle(client);
  }

  return global.db;
}

/**
 * Set the current workspace context for Row Level Security (RLS).
 * This must be called before any database operations that involve
 * workspace-scoped tables (tickets, user_workspaces).
 *
 * NOTE: currently a no-op at the DB layer — see the TODO comment at the top of
 * this file. Kept in place as scaffolding for the planned RLS revival.
 */
export async function setWorkspaceContext(workspaceId: number) {
  const db = getDb();
  // Use sql.raw for the value since SET doesn't support parameterized queries
  await db.execute(
    sql`SELECT set_config('app.current_workspace_id', ${workspaceId.toString()}, false)`,
  );
}

/**
 * Clear the workspace context. Call this after completing workspace-scoped operations
 * to prevent context leakage between requests.
 */
export async function clearWorkspaceContext() {
  const db = getDb();
  await db.execute(sql`RESET app.current_workspace_id`);
}
