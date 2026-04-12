import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";

export function createKysely(url: string): Kysely<any> {
  return new Kysely({
    dialect: new PostgresDialect({
      pool: new pg.Pool({ connectionString: url, max: 1 }),
    }),
  });
}
