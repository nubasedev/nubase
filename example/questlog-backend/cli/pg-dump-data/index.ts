// dot env

import shelljs from "shelljs";

export async function pgDumpData() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  shelljs.rm("-f", "db/dump-data.sql");

  shelljs.mkdir("-p", "db");

  shelljs.exec(
    `pg_dump ${databaseUrl} -f db/dump-data.sql --no-owner --no-acl`,
  );
}
