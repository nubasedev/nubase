// One-shot script: set up a questlog-compatible tickets schema on the
// docker pg-source, run generateAll against a temp data-layer containing
// just the questlog smoke-test .sql files, and write the generated .ts
// back to the questlog folder.
//
// Not a test — run manually when producing the initial smoke test artifact.
// Remove or leave in place; it's harmless.

import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { generateAll } from "../dist/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");

const SOURCE_URL = "postgresql://nubase:nubase@localhost:5450/nubase_source";

const SCHEMA_SQL = `
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

CREATE TABLE workspaces (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id),
  title VARCHAR(255) NOT NULL,
  description VARCHAR(1000),
  assignee_id INTEGER REFERENCES users(id)
);
`;

const QUESTLOG_DATA_LAYER = path.join(
  repoRoot,
  "apps",
  "questlog",
  "src",
  "backend",
  "data-layer",
);

async function main() {
  console.log("→ applying smoke-test schema to docker pg-source");
  const client = new Client({ connectionString: SOURCE_URL });
  await client.connect();
  try {
    await client.query(SCHEMA_SQL);
  } finally {
    await client.end();
  }

  console.log("→ staging .sql files in temp data-layer");
  const tmp = await mkdtemp(path.join(os.tmpdir(), "nubase-smoke-"));
  try {
    const ticketsDir = path.join(tmp, "tickets");
    await mkdir(ticketsDir, { recursive: true });
    const sqlSource = await readFile(
      path.join(QUESTLOG_DATA_LAYER, "tickets", "getTicketById.sql"),
      "utf8",
    );
    await writeFile(
      path.join(ticketsDir, "getTicketById.sql"),
      sqlSource,
      "utf8",
    );

    console.log("→ running generateAll");
    const result = await generateAll({
      databaseUrl: SOURCE_URL,
      dataLayerDir: tmp,
    });

    console.log("  generated:", result.generated.length);
    console.log("  errors:", result.errors.length);
    for (const err of result.errors) {
      console.error(err.diagnostic);
    }
    if (result.errors.length > 0) {
      process.exit(1);
    }

    const generated = await readFile(
      path.join(ticketsDir, "getTicketById.ts"),
      "utf8",
    );
    const destPath = path.join(
      QUESTLOG_DATA_LAYER,
      "tickets",
      "getTicketById.ts",
    );
    await writeFile(destPath, generated, "utf8");
    console.log(`→ wrote ${destPath}`);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
