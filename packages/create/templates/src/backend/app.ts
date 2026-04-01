import { createAuthMiddleware, registerHandlers } from "@nubase/backend";
import { Hono } from "hono";
import { authHandlers } from "./api/routes/auth";
import { dashboardHandlers } from "./api/routes/dashboard";
import { testUtilsHandlers } from "./api/routes/test-utils";
import { ticketHandlers } from "./api/routes/ticket";
import {
	createPostAuthWorkspaceMiddleware,
	createWorkspaceMiddleware,
} from "./middleware/workspace-middleware";
import { __PROJECT_NAME_PASCAL__AuthController } from "./auth";
import { loadEnv } from "./helpers/env";

// Load environment variables
loadEnv();

const app = new Hono();

// Auth controller
const authController = new __PROJECT_NAME_PASCAL__AuthController();

// Workspace middleware - handles login path (gets workspace from body)
app.use("*", createWorkspaceMiddleware());

// Auth middleware - extracts and verifies JWT, sets user in context
app.use("*", createAuthMiddleware({ controller: authController }));

// Post-auth workspace middleware - sets context from authenticated user's workspace
app.use("*", createPostAuthWorkspaceMiddleware());

// API routes - all handlers are mounted under /api
const api = new Hono();

api.get("/", (c) => c.json({ message: "Welcome to __PROJECT_NAME_PASCAL__ API" }));

registerHandlers(api, authHandlers);
registerHandlers(api, ticketHandlers);
registerHandlers(api, dashboardHandlers);

// Register test utility handlers (only in test environment)
if (process.env.NODE_ENV === "test") {
	registerHandlers(api, testUtilsHandlers);
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
