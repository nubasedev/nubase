import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getRoot } from "./api/routes/index";
import {
  handleDeleteTicket,
  handleGetTicketById,
  handleGetTickets,
  handlePostTicket,
  handlePutTicket,
} from "./api/routes/tickets";

config();

export const app = new Hono();

app.use(cors());

app.get("/", getRoot);

// Tickets - RESTful routes with type safety
app.get("/tickets", handleGetTickets);
app.get("/tickets/:id", handleGetTicketById);
app.post("/tickets", handlePostTicket);
app.put("/tickets/:id", handlePutTicket);
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
