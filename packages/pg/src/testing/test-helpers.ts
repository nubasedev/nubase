import { Client } from "pg";

const SOURCE_URL =
  process.env.PG_SOURCE_URL ??
  "postgresql://nubase:nubase@localhost:5450/nubase_source";
const TARGET_URL =
  process.env.PG_TARGET_URL ??
  "postgresql://nubase:nubase@localhost:5451/nubase_target";

interface TestContext {
  source: Client;
  target: Client;
}

async function createTestContext(): Promise<TestContext> {
  const source = new Client({ connectionString: SOURCE_URL });
  const target = new Client({ connectionString: TARGET_URL });
  await Promise.all([source.connect(), target.connect()]);
  return { source, target };
}

async function destroyTestContext(ctx: TestContext): Promise<void> {
  await Promise.all([ctx.source.end(), ctx.target.end()]);
}

async function resetDatabase(client: Client): Promise<void> {
  await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

async function setupSchema(client: Client, sql: string): Promise<void> {
  await client.query(sql);
}

export {
  SOURCE_URL,
  TARGET_URL,
  createTestContext,
  destroyTestContext,
  resetDatabase,
  setupSchema,
};
export type { TestContext };
