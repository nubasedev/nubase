import { config } from "dotenv";

/**
 * Load environment variables with proper fallback strategy
 *
 * Strategy:
 * 1. Load base .env file first (for default/fallback values)
 * 2. Load environment-specific .env.[NODE_ENV] file to override defaults
 *
 * This allows for a clean separation of default values and environment-specific overrides.
 *
 * Example:
 * - .env: DATABASE_URL=postgres://localhost:5432/myapp
 * - .env.development: DATABASE_URL=postgres://localhost:5434/myapp-dev
 * - .env.test: DATABASE_URL=postgres://localhost:5435/myapp-test
 */
export function loadEnvironment(): void {
  // Load base .env file first (fallback/default values)
  config({ path: ".env" });

  // Determine environment (default to production for safety)
  const env = process.env.NODE_ENV || "production";

  // Load environment-specific file to override defaults
  config({ path: `.env.${env}` });

  console.log(`[env] Loaded environment configuration for: ${env}`);
}
