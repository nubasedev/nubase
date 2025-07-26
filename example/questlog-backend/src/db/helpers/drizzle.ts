import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var db: NodePgDatabase | undefined;
}

export function getDb() {
  if (!global.db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not defined in the environment variables.",
      );
    }
    const databaseUrl = process.env.DATABASE_URL;
    const client = new Client({ connectionString: databaseUrl });
    global.db = drizzle(client);
  }

  return global.db;
}
