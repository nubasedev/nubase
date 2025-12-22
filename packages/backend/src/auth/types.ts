import type { Context } from "hono";

/**
 * Represents an authenticated user on the backend.
 * Generic type allows applications to define their own user shape.
 */
export interface BackendUser {
  id: number | string;
}

/**
 * Token payload that can be embedded in JWTs.
 * Applications can extend this with additional claims.
 */
export interface TokenPayload {
  /** User identifier */
  userId: number | string;
  /** Token issued at timestamp */
  iat?: number;
  /** Token expiration timestamp */
  exp?: number;
}

/**
 * Result of token verification.
 */
export type VerifyTokenResult<TUser extends BackendUser> =
  | { valid: true; user: TUser }
  | { valid: false; error: string };

/**
 * Authentication level for routes.
 */
export type AuthLevel = "required" | "optional" | "none";

/**
 * BackendAuthController interface.
 *
 * This is the core abstraction for backend authentication in Nubase applications.
 * Applications implement this interface to provide their own authentication logic.
 *
 * The controller handles:
 * - Token extraction from requests (cookies, headers)
 * - Token verification and user lookup
 * - Token creation for login flows
 *
 * Future extensibility:
 * - Token refresh
 * - Token revocation (logout, security)
 * - Two-factor authentication verification
 * - Social login / SSO token validation
 * - Session management
 *
 * @template TUser - The user type returned after authentication
 * @template TTokenPayload - Additional claims to include in tokens
 */
export interface BackendAuthController<
  TUser extends BackendUser = BackendUser,
  TTokenPayload extends TokenPayload = TokenPayload,
> {
  /**
   * Extract the authentication token from a request.
   * Typically looks in cookies or Authorization header.
   *
   * @param ctx - Hono context
   * @returns The token string or null if not present
   */
  extractToken(ctx: Context): string | null;

  /**
   * Verify a token and return the authenticated user.
   *
   * @param token - The token to verify
   * @returns Verification result with user or error
   */
  verifyToken(token: string): Promise<VerifyTokenResult<TUser>>;

  /**
   * Create a new authentication token for a user.
   * Used during login to generate the JWT.
   *
   * @param user - The user to create a token for
   * @param additionalPayload - Optional additional claims
   * @returns The signed token string
   */
  createToken(
    user: TUser,
    additionalPayload?: Partial<TTokenPayload>,
  ): Promise<string>;

  /**
   * Set the authentication token in the response.
   * Typically sets an HttpOnly cookie.
   *
   * @param ctx - Hono context
   * @param token - The token to set
   */
  setTokenInResponse(ctx: Context, token: string): void;

  /**
   * Clear the authentication token from the response.
   * Used during logout.
   *
   * @param ctx - Hono context
   */
  clearTokenFromResponse(ctx: Context): void;

  /**
   * Validate user credentials during login.
   * Looks up the user by username and verifies the password.
   *
   * @param username - The username to look up
   * @param password - The plain text password to verify
   * @returns The user if credentials are valid, null otherwise
   */
  validateCredentials(
    username: string,
    password: string,
  ): Promise<TUser | null>;

  // ============================================
  // Optional methods for future extensibility
  // ============================================

  /**
   * Refresh an existing token.
   * Returns a new token if the old one is valid but near expiration.
   *
   * @param token - The current token
   * @returns New token or null if refresh not possible
   */
  refreshToken?(token: string): Promise<string | null>;

  /**
   * Revoke a token (e.g., for logout or security).
   * Implementations may track revoked tokens in a blacklist.
   *
   * @param token - The token to revoke
   */
  revokeToken?(token: string): Promise<void>;

  /**
   * Verify a two-factor authentication code.
   *
   * @param userId - The user's ID
   * @param code - The 2FA code to verify
   * @returns Whether the code is valid
   */
  verify2FA?(userId: number | string, code: string): Promise<boolean>;

  /**
   * Check if a user requires 2FA.
   *
   * @param user - The user to check
   * @returns Whether 2FA is required
   */
  requires2FA?(user: TUser): boolean;

  /**
   * Validate an external OAuth/SSO token.
   *
   * @param provider - The OAuth provider (google, github, etc.)
   * @param token - The external token
   * @returns The user if valid, null otherwise
   */
  validateExternalToken?(
    provider: string,
    token: string,
  ): Promise<TUser | null>;

  /**
   * Link an external OAuth provider to a user account.
   *
   * @param userId - The user's ID
   * @param provider - The OAuth provider
   * @param externalId - The external provider's user ID
   */
  linkExternalProvider?(
    userId: number | string,
    provider: string,
    externalId: string,
  ): Promise<void>;

  /**
   * Create a server-side session (for SSO session sync).
   *
   * @param user - The user to create a session for
   * @returns The session ID
   */
  createSession?(user: TUser): Promise<string>;

  /**
   * Invalidate a session.
   *
   * @param sessionId - The session to invalidate
   */
  invalidateSession?(sessionId: string): Promise<void>;
}
