import shelljs from "shelljs";

export async function pgDump() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // make shelljs to output all commands
  shelljs.config.verbose = true;

  shelljs.rm("-f", "db/dump.sql");

  shelljs.mkdir("-p", "db");

  shelljs.exec(
    `pg_dump --file db/dump.sql --schema-only --no-owner --no-acl ${databaseUrl}`,
  );
  shelljs.cp("db/dump.sql", "docker/dev/postgresql-init/dump.sql");
  shelljs.cp("db/dump.sql", "docker/test/postgresql-init/dump.sql");
}
