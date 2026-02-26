import { HttpError } from "@nubase/backend";
import { and, desc, eq } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import { getDb } from "../../../db/helpers/drizzle";
import { appDeploymentsTable } from "../../../db/schema/app-deployment";
import { customEndpointRegistrationsTable } from "../../../db/schema/custom-endpoint-registration";
import { hookRegistrationsTable } from "../../../db/schema/hook-registration";
import type { Workspace } from "../../../middleware/workspace-middleware";

const MAX_BUNDLE_SIZE = 5 * 1024 * 1024; // 5MB

function getWorkspace(c: Context): Workspace {
  return c.get("workspace" as never) as Workspace;
}

function getUserId(c: Context): number {
  const user = c.get("user" as never) as { id: number } | null | undefined;
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }
  return user.id;
}

export const deploymentRoutes = new Hono();

/**
 * POST /api/nubase/apps/deploy
 * Upload and activate an app bundle.
 */
deploymentRoutes.post("/deploy", async (c) => {
  const workspace = getWorkspace(c);
  const userId = getUserId(c);

  const body = await c.req.json<{
    bundle: string;
    sourceMap?: string;
    manifest: {
      hooks?: Array<{
        hookKey: string;
        entityName: string;
        hookType: string;
      }>;
      endpoints?: Array<{ method: string; path: string }>;
      actions?: Array<{ name: string; entity: string; scope: string }>;
    };
    checksum: string;
    schemaVersion: string;
  }>();

  // Validate bundle size
  if (body.bundle.length > MAX_BUNDLE_SIZE) {
    throw new HttpError(
      413,
      `Bundle size exceeds maximum of ${MAX_BUNDLE_SIZE / 1024 / 1024}MB`,
    );
  }

  const db = getDb();

  // Deactivate current active deployment
  await db
    .update(appDeploymentsTable)
    .set({ isActive: false })
    .where(
      and(
        eq(appDeploymentsTable.workspaceId, workspace.id),
        eq(appDeploymentsTable.isActive, true),
      ),
    );

  // Get next version number
  const latestDeployment = await db
    .select({ version: appDeploymentsTable.version })
    .from(appDeploymentsTable)
    .where(eq(appDeploymentsTable.workspaceId, workspace.id))
    .orderBy(desc(appDeploymentsTable.version))
    .limit(1);

  const nextVersion =
    latestDeployment.length > 0 ? latestDeployment[0].version + 1 : 1;

  // Insert new deployment
  const [deployment] = await db
    .insert(appDeploymentsTable)
    .values({
      workspaceId: workspace.id,
      version: nextVersion,
      schemaVersion: body.schemaVersion,
      bundle: body.bundle,
      sourceMap: body.sourceMap ?? null,
      manifest: body.manifest,
      checksum: body.checksum,
      isActive: true,
      deployedBy: userId,
    })
    .returning();

  // Register hooks
  if (body.manifest.hooks && body.manifest.hooks.length > 0) {
    await db.insert(hookRegistrationsTable).values(
      body.manifest.hooks.map((hook) => ({
        workspaceId: workspace.id,
        deploymentId: deployment.id,
        hookKey: hook.hookKey,
        entityName: hook.entityName,
        hookType: hook.hookType,
      })),
    );
  }

  // Register custom endpoints
  if (body.manifest.endpoints && body.manifest.endpoints.length > 0) {
    await db.insert(customEndpointRegistrationsTable).values(
      body.manifest.endpoints.map((ep) => ({
        workspaceId: workspace.id,
        deploymentId: deployment.id,
        method: ep.method,
        path: ep.path,
      })),
    );
  }

  return c.json({
    id: deployment.id,
    version: deployment.version,
    isActive: deployment.isActive,
    deployedAt: deployment.deployedAt,
  });
});

/**
 * GET /api/nubase/apps/deployments
 * List deployment history for the current workspace.
 */
deploymentRoutes.get("/deployments", async (c) => {
  const workspace = getWorkspace(c);
  const db = getDb();

  const deployments = await db
    .select({
      id: appDeploymentsTable.id,
      version: appDeploymentsTable.version,
      schemaVersion: appDeploymentsTable.schemaVersion,
      checksum: appDeploymentsTable.checksum,
      isActive: appDeploymentsTable.isActive,
      deployedBy: appDeploymentsTable.deployedBy,
      deployedAt: appDeploymentsTable.deployedAt,
    })
    .from(appDeploymentsTable)
    .where(eq(appDeploymentsTable.workspaceId, workspace.id))
    .orderBy(desc(appDeploymentsTable.version));

  return c.json(deployments);
});

/**
 * POST /api/nubase/apps/deployments/:id/activate
 * Rollback to a previous deployment.
 */
deploymentRoutes.post("/deployments/:id/activate", async (c) => {
  const workspace = getWorkspace(c);
  const deploymentId = Number(c.req.param("id"));
  const db = getDb();

  // Verify deployment exists and belongs to this workspace
  const [target] = await db
    .select()
    .from(appDeploymentsTable)
    .where(
      and(
        eq(appDeploymentsTable.id, deploymentId),
        eq(appDeploymentsTable.workspaceId, workspace.id),
      ),
    );

  if (!target) {
    throw new HttpError(404, "Deployment not found");
  }

  // Deactivate all deployments
  await db
    .update(appDeploymentsTable)
    .set({ isActive: false })
    .where(eq(appDeploymentsTable.workspaceId, workspace.id));

  // Activate target
  await db
    .update(appDeploymentsTable)
    .set({ isActive: true })
    .where(eq(appDeploymentsTable.id, deploymentId));

  // Clear old registrations and re-register from target manifest
  await db
    .delete(hookRegistrationsTable)
    .where(eq(hookRegistrationsTable.workspaceId, workspace.id));

  await db
    .delete(customEndpointRegistrationsTable)
    .where(eq(customEndpointRegistrationsTable.workspaceId, workspace.id));

  const manifest = target.manifest as {
    hooks?: Array<{
      hookKey: string;
      entityName: string;
      hookType: string;
    }>;
    endpoints?: Array<{ method: string; path: string }>;
  };

  if (manifest.hooks && manifest.hooks.length > 0) {
    await db.insert(hookRegistrationsTable).values(
      manifest.hooks.map((hook) => ({
        workspaceId: workspace.id,
        deploymentId: target.id,
        hookKey: hook.hookKey,
        entityName: hook.entityName,
        hookType: hook.hookType,
      })),
    );
  }

  if (manifest.endpoints && manifest.endpoints.length > 0) {
    await db.insert(customEndpointRegistrationsTable).values(
      manifest.endpoints.map((ep) => ({
        workspaceId: workspace.id,
        deploymentId: target.id,
        method: ep.method,
        path: ep.path,
      })),
    );
  }

  return c.json({
    id: target.id,
    version: target.version,
    isActive: true,
  });
});

/**
 * GET /api/nubase/apps/status
 * Get current deployment status for the workspace.
 */
deploymentRoutes.get("/status", async (c) => {
  const workspace = getWorkspace(c);
  const db = getDb();

  const [active] = await db
    .select({
      id: appDeploymentsTable.id,
      version: appDeploymentsTable.version,
      schemaVersion: appDeploymentsTable.schemaVersion,
      checksum: appDeploymentsTable.checksum,
      deployedBy: appDeploymentsTable.deployedBy,
      deployedAt: appDeploymentsTable.deployedAt,
    })
    .from(appDeploymentsTable)
    .where(
      and(
        eq(appDeploymentsTable.workspaceId, workspace.id),
        eq(appDeploymentsTable.isActive, true),
      ),
    );

  if (!active) {
    return c.json({ hasActiveDeployment: false });
  }

  // Count registrations
  const hooks = await db
    .select()
    .from(hookRegistrationsTable)
    .where(eq(hookRegistrationsTable.workspaceId, workspace.id));

  const endpoints = await db
    .select()
    .from(customEndpointRegistrationsTable)
    .where(eq(customEndpointRegistrationsTable.workspaceId, workspace.id));

  return c.json({
    hasActiveDeployment: true,
    deployment: active,
    registrations: {
      hooks: hooks.length,
      endpoints: endpoints.length,
    },
  });
});
