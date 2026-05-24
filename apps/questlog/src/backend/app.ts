import { createAuthMiddleware, registerHandlers } from "@nubase/backend";
import { Hono } from "hono";
import { authHandlers } from "./api/auth-api";
import { dashboardHandlers } from "./api/dashboard-api";
import { teamHandlers } from "./api/team-api";
import { testUtils } from "./api/test-utils-api";
import { ticketHandlers } from "./api/ticket-api";
import { userHandlers } from "./api/user-api";
import { questlogAuthController } from "./auth";
import { loadEnvironment } from "./helpers/env";
import {
  createPostAuthWorkspaceMiddleware,
  createWorkspaceMiddleware,
} from "./middleware/workspace-middleware";

// Load environment variables
loadEnvironment();

const app = new Hono();

// Workspace middleware - handles login path (gets workspace from body)
// For other paths, workspace will be set from JWT by post-auth middleware
app.use("*", createWorkspaceMiddleware());

// Auth middleware - extracts and verifies JWT, sets user in context
app.use("*", createAuthMiddleware({ controller: questlogAuthController }));

// Post-auth workspace middleware - sets RLS context from authenticated user's workspace
app.use("*", createPostAuthWorkspaceMiddleware());

// API routes - all handlers are mounted under /api
const api = new Hono();

api.get("/", (c) => c.json({ message: "Welcome to Questlog API" }));

registerHandlers(api, authHandlers);
registerHandlers(api, ticketHandlers);
registerHandlers(api, userHandlers);
registerHandlers(api, teamHandlers);
registerHandlers(api, dashboardHandlers);

// Test utility routes - only enabled in test environment
if (process.env.NODE_ENV === "test" || process.env.DB_PORT === "5435") {
  api.route("/", testUtils);
}

app.route("/api", api);

// Production: serve built frontend assets and SPA fallback
if (import.meta.env.PROD) {
  const { serveStatic } = await import("@hono/node-server/serve-static");
  const { readFile } = await import("node:fs/promises");

  app.use("/assets/*", serveStatic({ root: "./dist/client" }));
  app.use("/favicon.ico", serveStatic({ root: "./dist/client" }));

  const indexHtml = await readFile("./dist/client/index.html", "utf-8");
  app.get("*", (c) => c.html(indexHtml));
}

export default app;
