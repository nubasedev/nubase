import { serve } from "@hono/node-server";
import { createAuthMiddleware } from "@nubase/backend";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getRoot } from "./api/routes";
import {
  handleGetMe,
  handleLogin,
  handleLoginComplete,
  handleLoginStart,
  handleLogout,
  handleSignup,
} from "./api/routes/auth";
import { testUtils } from "./api/routes/test-utils";
import {
  handleDeleteTicket,
  handleGetTicket,
  handleGetTickets,
  handlePatchTicket,
  handlePostTicket,
} from "./api/routes/ticket";
import { questlogAuthController } from "./auth";
import { loadEnvironment } from "./helpers/env";
import {
  createPostAuthWorkspaceMiddleware,
  createWorkspaceMiddleware,
} from "./middleware/workspace-middleware";

// Load environment variables
loadEnvironment();

export const app = new Hono();

// CORS middleware - allow localhost origins for path-based multi-tenancy
app.use(
  cors({
    origin: (origin) => {
      // Allow localhost origins (path-based tenancy doesn't use subdomains)
      if (origin?.match(/^http:\/\/localhost(:\d+)?$/)) {
        return origin;
      }
      return null;
    },
    credentials: true,
  }),
);

// Workspace middleware - handles login path (gets workspace from body)
// For other paths, workspace will be set from JWT by post-auth middleware
app.use("*", createWorkspaceMiddleware());

// Auth middleware - extracts and verifies JWT, sets user in context
app.use("*", createAuthMiddleware({ controller: questlogAuthController }));

// Post-auth workspace middleware - sets RLS context from authenticated user's workspace
app.use("*", createPostAuthWorkspaceMiddleware());

app.get("/", getRoot);

// Auth routes - Two-step login flow
app.post("/auth/login/start", handleLoginStart); // Step 1: validate credentials, get workspaces
app.post("/auth/login/complete", handleLoginComplete); // Step 2: select workspace, get token
app.post("/auth/login", handleLogin); // Legacy single-step login (deprecated)
app.post("/auth/logout", handleLogout);
app.get("/auth/me", handleGetMe);
app.post("/auth/signup", handleSignup); // Create new workspace and admin user

// Tickets - RESTful routes with type safety
app.get("/tickets", handleGetTickets);
app.get("/tickets/:id", handleGetTicket);
app.post("/tickets", handlePostTicket);
app.patch("/tickets/:id", handlePatchTicket);
app.delete("/tickets/:id", handleDeleteTicket);

// Test utility routes - only enabled in test environment
if (process.env.NODE_ENV === "test" || process.env.DB_PORT === "5435") {
  app.route("/", testUtils);
}

const port = Number(process.env.PORT) || 3001;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
