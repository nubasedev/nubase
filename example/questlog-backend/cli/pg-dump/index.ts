import shelljs from "shelljs";

export interface PgDumpOptions {
  output?: string;
}

export async function pgDump(options: PgDumpOptions = {}) {
  // Use admin connection for pg_dump (needs full access to dump schema)
  const databaseUrl =
    process.env.DATABASE_URL_ADMIN || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL_ADMIN or DATABASE_URL is not set");
  }

  const outputFile = options.output || "db/schema.sql";

  // make shelljs to output all commands
  shelljs.config.verbose = true;

  shelljs.rm("-f", outputFile);

  // Ensure directory exists
  const dir = outputFile.substring(0, outputFile.lastIndexOf("/"));
  if (dir) {
    shelljs.mkdir("-p", dir);
  }

  shelljs.exec(
    `pg_dump --file ${outputFile} --schema-only --no-owner --no-acl ${databaseUrl}`,
  );

  console.log(`\nSchema dumped to ${outputFile}`);
  console.log("Run 'npm run db:schema-sync' to copy to Docker init folders.");
}
