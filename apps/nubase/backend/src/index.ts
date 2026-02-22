import { serve } from "@hono/node-server";
import { createAuthMiddleware, registerHandlers } from "@nubase/backend";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getRoot } from "./api/routes";
import { authHandlers } from "./api/routes/auth";
import { dashboardHandlers } from "./api/routes/dashboard";
import { testUtils } from "./api/routes/test-utils";
import { ticketHandlers } from "./api/routes/ticket";
import { userHandlers } from "./api/routes/user";
import { nubaseAuthController } from "./auth";
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
app.use("*", createAuthMiddleware({ controller: nubaseAuthController }));

// Post-auth workspace middleware - sets RLS context from authenticated user's workspace
app.use("*", createPostAuthWorkspaceMiddleware());

app.get("/", getRoot);

// Register all handlers - path and method extracted from endpoint metadata
registerHandlers(app, authHandlers);
registerHandlers(app, ticketHandlers);
registerHandlers(app, userHandlers);
registerHandlers(app, dashboardHandlers);

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
