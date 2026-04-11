// Regenerate every typed-sql .ts file for the questlog data-layer.
//
// Workflow: rsync the questlog data-layer/ tree into a temp folder, apply a
// questlog-compatible schema to docker pg-source, run generateAll against
// the temp tree, and copy the generated .ts files back. This lets us
// regenerate without depending on the questlog dev DB being up or its state
// matching what the `.sql` files expect.
//
// Run manually after editing any `.sql` file under
// apps/questlog/src/backend/data-layer/.

import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { generateAll } from "../dist/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");

const SOURCE_URL = "postgresql://nubase:nubase@localhost:5450/nubase_source";

// Keep in sync with apps/questlog/src/backend/db/schema/*.ts. We only need
// enough of the schema for the currently-written .sql files to parse.
const SCHEMA_SQL = `
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS user_workspaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

CREATE TABLE workspaces (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
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

async function copySqlFiles(fromDir, toDir) {
  const copied = [];
  const entries = await readdir(fromDir, { withFileTypes: true });
  for (const entry of entries) {
    const absFrom = path.join(fromDir, entry.name);
    const absTo = path.join(toDir, entry.name);
    if (entry.isDirectory()) {
      await mkdir(absTo, { recursive: true });
      copied.push(...(await copySqlFiles(absFrom, absTo)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".sql")) {
      const content = await readFile(absFrom, "utf8");
      await writeFile(absTo, content, "utf8");
      copied.push(absFrom);
    }
  }
  return copied;
}

async function copyGeneratedTsBack(tmp, questlogRoot) {
  const written = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(abs);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".ts")) {
        const rel = path.relative(tmp, abs);
        const dest = path.join(questlogRoot, rel);
        await mkdir(path.dirname(dest), { recursive: true });
        const content = await readFile(abs, "utf8");
        await writeFile(dest, content, "utf8");
        written.push(dest);
      }
    }
  }
  await walk(tmp);
  return written;
}

async function main() {
  try {
    await stat(QUESTLOG_DATA_LAYER);
  } catch {
    console.error(`data-layer directory not found: ${QUESTLOG_DATA_LAYER}`);
    process.exit(1);
  }

  console.log("→ applying questlog-compatible schema to docker pg-source");
  const client = new Client({ connectionString: SOURCE_URL });
  await client.connect();
  try {
    await client.query(SCHEMA_SQL);
  } finally {
    await client.end();
  }

  const tmp = await mkdtemp(path.join(os.tmpdir(), "nubase-regen-"));
  try {
    console.log("→ staging .sql files in temp data-layer");
    const copied = await copySqlFiles(QUESTLOG_DATA_LAYER, tmp);
    console.log(`  copied ${copied.length} .sql files`);

    console.log("→ running generateAll");
    const result = await generateAll({
      databaseUrl: SOURCE_URL,
      dataLayerDir: tmp,
    });

    console.log(`  generated: ${result.generated.length}`);
    console.log(`  unchanged: ${result.unchanged.length}`);
    console.log(`  errors:    ${result.errors.length}`);
    for (const err of result.errors) {
      console.error("\n" + err.diagnostic);
    }
    if (result.errors.length > 0) {
      process.exit(1);
    }

    const written = await copyGeneratedTsBack(tmp, QUESTLOG_DATA_LAYER);
    for (const p of written) {
      console.log(`→ wrote ${path.relative(repoRoot, p)}`);
    }
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
