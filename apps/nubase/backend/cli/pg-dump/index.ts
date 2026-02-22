import shelljs from "shelljs";

export interface PgDumpOptions {
  output?: string;
}

export async function pgDump(_options: PgDumpOptions = {}) {
  // make shelljs to output all commands
  shelljs.config.verbose = true;

  // Dump nubase_db schema
  const nubaseDbUrl =
    process.env.DATABASE_URL_ADMIN || process.env.DATABASE_URL;
  if (!nubaseDbUrl) {
    throw new Error("DATABASE_URL_ADMIN or DATABASE_URL is not set");
  }

  const nubaseDbOutput = "db/nubase-db-schema.sql";
  shelljs.rm("-f", nubaseDbOutput);
  shelljs.mkdir("-p", "db");
  shelljs.exec(
    `pg_dump --file ${nubaseDbOutput} --schema-only --no-owner --no-acl ${nubaseDbUrl}`,
  );
  console.log(`\nnubase_db schema dumped to ${nubaseDbOutput}`);

  // Dump data_db schema
  const dataDbUrl =
    process.env.DATA_DATABASE_URL_ADMIN || process.env.DATA_DATABASE_URL;
  if (!dataDbUrl) {
    throw new Error("DATA_DATABASE_URL_ADMIN or DATA_DATABASE_URL is not set");
  }

  const dataDbOutput = "db/data-db-schema.sql";
  shelljs.rm("-f", dataDbOutput);
  shelljs.exec(
    `pg_dump --file ${dataDbOutput} --schema-only --no-owner --no-acl ${dataDbUrl}`,
  );
  console.log(`\ndata_db schema dumped to ${dataDbOutput}`);

  console.log("\nRun 'npm run db:schema-sync' to copy to Docker init folders.");
}
