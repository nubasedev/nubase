import { CamelCasePlugin, Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";
import type { DB } from "../db-types";

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
//       — session-level, not transaction-local — on a shared connection.
//       Two concurrent requests interleaving queries on that connection can see
//       each other's workspace_id. The fix is to wrap each request in
//       db.transaction() and use set_config(..., true) (SET LOCAL semantics).
//
//   (b) POOLING: Using pg.Pool now (better than the previous single pg.Client),
//       but SET LOCAL + transactions is still the clean combination for proper
//       RLS enforcement.
//
// Until the above is done, RLS-related code (this file's setWorkspaceContext/
// clearWorkspaceContext, the RLS policies in the migrations, the middleware
// calls in workspace-middleware.ts) is kept in place as scaffolding — harmless,
// and it documents the intended shape for the future refactor.
// =============================================================================

declare global {
  var db: Kysely<DB> | undefined;
}

/**
 * Get the database connection.
 */
export function getDb(): Kysely<DB> {
  if (!global.db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not defined in the environment variables.",
      );
    }
    global.db = new Kysely({
      dialect: new PostgresDialect({
        pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }),
      }),
      plugins: [new CamelCasePlugin()],
    });
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
  await sql`SELECT set_config('app.current_workspace_id', ${workspaceId.toString()}, false)`.execute(
    db,
  );
}

/**
 * Clear the workspace context. Call this after completing workspace-scoped operations
 * to prevent context leakage between requests.
 */
export async function clearWorkspaceContext() {
  const db = getDb();
  await sql`RESET app.current_workspace_id`.execute(db);
}
