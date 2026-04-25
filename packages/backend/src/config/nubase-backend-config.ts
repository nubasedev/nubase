/**
 * Configuration for the auth section of {@link NubaseBackendConfig}.
 * Consumed by `BackendAuthController` implementations to derive JWT and
 * cookie behaviour.
 */
export interface NubaseBackendAuthConfig {
  /** Secret used to sign and verify session JWTs. */
  jwtSecret: string;
  /**
   * Lifetime of the session, in seconds. Applied to both the JWT `exp`
   * claim and the session cookie's `Max-Age`.
   */
  sessionMaxAgeSeconds: number;
  /** Name of the HttpOnly cookie that carries the session JWT. */
  cookieName: string;
}

/**
 * Backend application configuration for a Nubase app.
 *
 * An app declares this in `src/backend/backend-config.ts` and the wiring
 * code (controller singletons, middleware factories) reads it. The type
 * lives in the framework so all Nubase apps share one shape; apps may
 * extend it with their own sections by intersecting with this type.
 *
 * @example
 * ```ts
 * import type { NubaseBackendConfig } from "@nubase/backend";
 *
 * export const config: NubaseBackendConfig = {
 *   auth: {
 *     jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
 *     sessionMaxAgeSeconds: 60 * 60 * 24 * 30,
 *     cookieName: "nubase_auth",
 *   },
 * };
 * ```
 */
export interface NubaseBackendConfig {
  auth: NubaseBackendAuthConfig;
}
