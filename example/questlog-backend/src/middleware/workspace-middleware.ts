import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import {
  clearWorkspaceContext,
  getDb,
  setWorkspaceContext,
} from "../db/helpers/drizzle";
import { workspacesTable } from "../db/schema/workspace";

export interface Workspace {
  id: number;
  slug: string;
  name: string;
}

// Paths that don't require a workspace to exist (for bootstrapping and health checks)
const WORKSPACE_BYPASS_PATHS = ["/", "/api/test/ensure-workspace"];

// Paths where workspace comes from request body (login) instead of JWT
const WORKSPACE_FROM_BODY_PATHS = ["/auth/login"];

/**
 * Workspace middleware for path-based multi-workspace.
 *
 * For most authenticated requests, the workspace is identified from the JWT token.
 * For login requests, the workspace slug is provided in the request body.
 *
 * This middleware sets the workspace in the Hono context and establishes the RLS context
 * for database queries.
 */
export function createWorkspaceMiddleware() {
  return createMiddleware<{ Variables: { workspace: Workspace } }>(
    async (c, next) => {
      const path = c.req.path;

      // Allow certain paths to bypass workspace check (for bootstrapping)
      if (WORKSPACE_BYPASS_PATHS.includes(path)) {
        return next();
      }

      // For login, workspace will be handled by the login handler itself
      // Skip workspace middleware for these paths
      if (WORKSPACE_FROM_BODY_PATHS.includes(path)) {
        return next();
      }

      // For other paths, workspace will be set from JWT by auth middleware
      // The auth middleware runs after this and sets user with workspaceId
      // We'll set up RLS context after auth middleware identifies the user
      return next();
    },
  );
}

/**
 * Post-auth middleware that sets RLS context based on authenticated user's workspace.
 * This should run after the auth middleware.
 */
export function createPostAuthWorkspaceMiddleware() {
  return createMiddleware<{
    Variables: { workspace: Workspace; user: { workspaceId: number } | null };
  }>(async (c, next) => {
    const path = c.req.path;

    // Skip for bypass paths and login (already handled)
    if (
      WORKSPACE_BYPASS_PATHS.includes(path) ||
      WORKSPACE_FROM_BODY_PATHS.includes(path)
    ) {
      return next();
    }

    // If workspace is already set (e.g., from login path), skip
    const existingWorkspace = c.get("workspace");
    if (existingWorkspace) {
      return next();
    }

    // Get user from auth middleware
    const user = c.get("user");

    if (!user || !user.workspaceId) {
      // No authenticated user - proceed without workspace context
      // Protected routes will fail at the auth level
      return next();
    }

    // Look up workspace from user's workspaceId
    const db = getDb();
    const workspaces = await db
      .select()
      .from(workspacesTable)
      .where(eq(workspacesTable.id, user.workspaceId));

    if (workspaces.length === 0) {
      return c.json({ error: "User's workspace not found" }, 500);
    }

    const workspace = {
      id: workspaces[0].id,
      slug: workspaces[0].slug,
      name: workspaces[0].name,
    };

    c.set("workspace", workspace);
    await setWorkspaceContext(workspace.id);

    try {
      return await next();
    } finally {
      await clearWorkspaceContext();
    }
  });
}
