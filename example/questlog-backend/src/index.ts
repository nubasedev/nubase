import { serve } from "@hono/node-server";
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
import { loadEnvironment } from "./helpers/env";

// Load environment variables
loadEnvironment();

export const app = new Hono();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:4000", // Test frontend
    ],
    credentials: true,
  }),
);

app.get("/", getRoot);

// Auth routes
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
