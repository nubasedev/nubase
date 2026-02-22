import shelljs from "shelljs";

export async function pgDumpData() {
  shelljs.mkdir("-p", "db");

  // Dump nubase_db data
  const nubaseDbUrl = process.env.DATABASE_URL;
  if (!nubaseDbUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  shelljs.rm("-f", "db/nubase-db-dump-data.sql");
  shelljs.exec(
    `pg_dump ${nubaseDbUrl} -f db/nubase-db-dump-data.sql --no-owner --no-acl`,
  );
  console.log("nubase_db data dumped to db/nubase-db-dump-data.sql");

  // Dump data_db data
  const dataDbUrl = process.env.DATA_DATABASE_URL;
  if (!dataDbUrl) {
    throw new Error("DATA_DATABASE_URL is not set");
  }

  shelljs.rm("-f", "db/data-db-dump-data.sql");
  shelljs.exec(
    `pg_dump ${dataDbUrl} -f db/data-db-dump-data.sql --no-owner --no-acl`,
  );
  console.log("data_db data dumped to db/data-db-dump-data.sql");
}
