import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ticketHandlers } from "./api/routes/ticket";
import { authHandlers } from "./api/routes/auth";
import { workspaceMiddleware } from "./middleware/workspace-middleware";
import { __PROJECT_NAME_PASCAL__AuthController } from "./auth";
import { loadEnv } from "./helpers/env";

// Load environment variables
loadEnv();

const app = new Hono();

// CORS configuration
app.use(
	"*",
	cors({
		origin: ["http://localhost:__FRONTEND_PORT__"],
		credentials: true,
	}),
);

// Workspace middleware (extracts workspace from path)
app.use("/:workspace/*", workspaceMiddleware);

// Auth controller
const authController = new __PROJECT_NAME_PASCAL__AuthController();

// Routes
app.get("/:workspace", (c) => c.json({ message: "Welcome to __PROJECT_NAME_PASCAL__ API" }));

// Auth routes
app.post("/:workspace/auth/login/start", authHandlers.loginStart);
app.post("/:workspace/auth/login/complete", authHandlers.loginComplete);
app.post("/:workspace/auth/login", authHandlers.login);
app.post("/:workspace/auth/logout", authHandlers.logout);
app.get("/:workspace/auth/me", authHandlers.getMe);
app.post("/:workspace/auth/signup", authHandlers.signup);

// Ticket routes
app.get("/:workspace/tickets", ticketHandlers.getTickets);
app.get("/:workspace/tickets/:id", ticketHandlers.getTicket);
app.post("/:workspace/tickets", ticketHandlers.postTicket);
app.patch("/:workspace/tickets/:id", ticketHandlers.patchTicket);
app.delete("/:workspace/tickets/:id", ticketHandlers.deleteTicket);

const port = Number(process.env.PORT) || __BACKEND_PORT__;

console.log(`Server is running on http://localhost:${port}`);

serve({
	fetch: app.fetch,
	port,
});
