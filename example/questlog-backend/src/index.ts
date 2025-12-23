import { serve } from "@hono/node-server";
import { createAuthMiddleware } from "@nubase/backend";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getRoot } from "./api/routes";
import { handleGetMe, handleLogin, handleLogout } from "./api/routes/auth";
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
import { createTenantMiddleware } from "./middleware/tenant-middleware";

// Load environment variables
loadEnvironment();

export const app = new Hono();

// CORS middleware - allow any subdomain of localhost
app.use(
  cors({
    origin: (origin) => {
      // Allow any subdomain of localhost (e.g., tavern.localhost:3001)
      if (origin?.match(/^http:\/\/[\w-]+\.localhost(:\d+)?$/)) {
        return origin;
      }
      // Fallback origins for backward compatibility
      if (
        ["http://localhost:3002", "http://localhost:4002"].includes(
          origin || "",
        )
      ) {
        return origin;
      }
      return null;
    },
    credentials: true,
  }),
);

// Tenant middleware - extracts tenant from subdomain
// Must come before auth middleware
app.use("*", createTenantMiddleware());

// Auth middleware - extracts and verifies JWT, sets user in context
app.use("*", createAuthMiddleware({ controller: questlogAuthController }));

app.get("/", getRoot);

// Auth routes - using custom handlers that support multi-tenancy
app.post("/auth/login", handleLogin);
app.post("/auth/logout", handleLogout);
app.get("/auth/me", handleGetMe);

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
