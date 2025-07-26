import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getRoot } from "./api/routes/index";
import { getTickets, postTickets } from "./api/routes/tickets";

config();

export const app = new Hono();

app.use(cors());

app.get("/", getRoot);

// Tickets
app.get("/tickets", getTickets);
app.post("/tickets", postTickets);

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
