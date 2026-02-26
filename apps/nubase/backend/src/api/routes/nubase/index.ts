import { Hono } from "hono";
import { deploymentRoutes } from "./deployments";
import { schemaRoutes } from "./schema";

/**
 * Nubase platform API routes.
 * Mounted at /api/nubase/* on the main app.
 */
export const nubaseRoutes = new Hono();

nubaseRoutes.route("/schema", schemaRoutes);
nubaseRoutes.route("/apps", deploymentRoutes);
