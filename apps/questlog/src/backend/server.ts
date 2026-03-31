import { readFile } from "node:fs/promises";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import app from "./app";

// Serve built frontend assets
app.use("/assets/*", serveStatic({ root: "./dist/client" }));
app.use("/favicon.ico", serveStatic({ root: "./dist/client" }));

// SPA fallback - serve index.html for all non-API routes
const indexHtml = await readFile("./dist/client/index.html", "utf-8");
app.get("*", (c) => c.html(indexHtml));

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
