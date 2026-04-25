import type { NubaseBackendConfig } from "@nubase/backend";

/**
 * Backend configuration for __PROJECT_NAME_PASCAL__.
 *
 * The shape comes from `@nubase/backend` (see {@link NubaseBackendConfig}).
 * This file holds the values; consumers — auth controller, middleware,
 * etc. — receive the relevant section via constructor parameters and never
 * touch `process.env` directly.
 */

const SECONDS_IN_A_DAY = 60 * 60 * 24;

export const config: NubaseBackendConfig = {
  auth: {
    jwtSecret:
      process.env.JWT_SECRET || "nubase-dev-secret-change-in-production",
    sessionMaxAgeSeconds: 30 * SECONDS_IN_A_DAY,
    cookieName: "nubase_auth",
  },
};
