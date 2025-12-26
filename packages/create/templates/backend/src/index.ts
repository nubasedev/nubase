import { serve } from "@hono/node-server";
import { createAuthMiddleware, registerHandlers } from "@nubase/backend";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ticketHandlers } from "./api/routes/ticket";
import { authHandlers } from "./api/routes/auth";
import { testUtilsHandlers } from "./api/routes/test-utils";
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

// CORS configuration
app.use(
	"*",
	cors({
		origin: (origin) => {
			// Allow localhost origins
			if (origin?.match(/^http:\/\/localhost(:\d+)?$/)) {
				return origin;
			}
			return null;
		},
		credentials: true,
	}),
);

// Workspace middleware - handles login path (gets workspace from body)
app.use("*", createWorkspaceMiddleware());

// Auth middleware - extracts and verifies JWT, sets user in context
app.use("*", createAuthMiddleware({ controller: authController }));

// Post-auth workspace middleware - sets context from authenticated user's workspace
app.use("*", createPostAuthWorkspaceMiddleware());

// Root route
app.get("/", (c) => c.json({ message: "Welcome to __PROJECT_NAME_PASCAL__ API" }));

// Register all handlers - path and method extracted from endpoint metadata
registerHandlers(app, authHandlers);
registerHandlers(app, ticketHandlers);

// Register test utility handlers (only in test environment)
if (process.env.NODE_ENV === "test") {
	registerHandlers(app, testUtilsHandlers);
}

const port = Number(process.env.PORT) || __BACKEND_PORT__;

console.log(`Server is running on http://localhost:${port}`);

serve({
	fetch: app.fetch,
	port,
});
