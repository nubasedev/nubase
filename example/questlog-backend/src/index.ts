import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getRoot } from "./api/routes";
import {
  handleDeleteTicket,
  handleGetTicket,
  handleGetTickets,
  handlePatchTicket,
  handlePostTicket,
} from "./api/routes/ticket";

config();

export const app = new Hono();

app.use(cors());

app.get("/", getRoot);

// Tickets - RESTful routes with type safety
app.get("/tickets", handleGetTickets);
app.get("/tickets/:id", handleGetTicket);
app.post("/tickets", handlePostTicket);
app.patch("/tickets/:id", handlePatchTicket);
app.delete("/tickets/:id", handleDeleteTicket);

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
