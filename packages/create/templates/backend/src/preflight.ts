import { validateEnvironment } from "@nubase/backend";
import { loadEnv } from "./helpers/env";

// Load environment variables
loadEnv();

// Verify database connectivity before starting the server
try {
	await validateEnvironment();
	console.log("Preflight check passed: Database connection verified");
} catch (err) {
	console.error(
		"Preflight check failed:",
		err instanceof Error ? err.message : err,
	);
	console.error("Please ensure the database is running and accessible.");
	process.exit(1);
}
