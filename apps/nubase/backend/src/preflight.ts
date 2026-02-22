import { validateEnvironment } from "@nubase/backend";
import { loadEnvironment } from "./helpers/env";

// Load environment variables
loadEnvironment();

// Verify database connectivity before starting the server
try {
  await validateEnvironment({ databaseUrl: process.env.DATABASE_URL });
  console.log("Preflight check passed: nubase_db connection verified");

  await validateEnvironment({ databaseUrl: process.env.DATA_DATABASE_URL });
  console.log("Preflight check passed: data_db connection verified");
} catch (err) {
  console.error(
    "Preflight check failed:",
    err instanceof Error ? err.message : err,
  );
  console.error("Please ensure the database is running and accessible.");
  process.exit(1);
}
