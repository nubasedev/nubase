import { createAuthMiddleware, registerHandlers } from "@nubase/backend";
import { Hono } from "hono";
import { authHandlers } from "./api/routes/auth";
import { dashboardHandlers } from "./api/routes/dashboard";
import { testUtils } from "./api/routes/test-utils";
import { ticketHandlers } from "./api/routes/ticket";
import { userHandlers } from "./api/routes/user";
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
registerHandlers(api, dashboardHandlers);

// Test utility routes - only enabled in test environment
if (process.env.NODE_ENV === "test" || process.env.DB_PORT === "5435") {
  api.route("/", testUtils);
}

app.route("/api", api);

export default app;
