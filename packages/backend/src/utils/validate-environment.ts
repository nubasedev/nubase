import { Client } from "pg";

export interface ValidateEnvironmentOptions {
  /**
   * The database URL to validate connectivity against.
   * Defaults to process.env.DATABASE_URL
   */
  databaseUrl?: string;
}

/**
 * Validates that the environment is properly configured and database is accessible.
 * Should be called at application startup before starting the server.
 *
 * @throws Error if DATABASE_URL is not defined or database is not accessible
 */
export async function validateEnvironment(
  options: ValidateEnvironmentOptions = {},
): Promise<void> {
  const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not defined in the environment variables.",
    );
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    await client.query("SELECT 1");
    await client.end();
  } catch (err) {
    await client.end().catch(() => {});
    throw new Error(
      `Failed to connect to database: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
