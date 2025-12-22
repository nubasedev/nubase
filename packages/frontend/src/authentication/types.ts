/**
 * Represents an authenticated user in the system.
 * Applications can extend this with additional fields as needed.
 */
export interface AuthenticatedUser {
  id: number;
  email: string;
  username: string;
}

/**
 * Authentication state managed by the AuthenticationController.
 */
export interface AuthenticationState {
  /** Current authentication status */
  status: "loading" | "authenticated" | "unauthenticated";
  /** The authenticated user, if any */
  user: AuthenticatedUser | null;
  /** Any error that occurred during authentication */
  error: Error | null;
}

/**
 * Listener function for authentication state changes.
 */
export type AuthenticationStateListener = (state: AuthenticationState) => void;

/**
 * Login credentials for username/password authentication.
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * AuthenticationController interface.
 *
 * This is the core abstraction for authentication in Nubase applications.
 * Applications implement this interface to provide their own authentication logic.
 *
 * The controller manages authentication state and provides methods for:
 * - Logging in and out
 * - Checking current authentication status
 * - Subscribing to state changes
 *
 * Future extensibility:
 * - Social login providers (Google, GitHub, etc.)
 * - Forgot password / password reset
 * - Two-factor authentication
 * - Session management
 */
export interface AuthenticationController {
  /**
   * Get the current authentication state.
   */
  getState(): AuthenticationState;

  /**
   * Subscribe to authentication state changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: AuthenticationStateListener): () => void;

  /**
   * Log in with username and password.
   * On success, updates state to authenticated.
   * On failure, throws an error.
   */
  login(credentials: LoginCredentials): Promise<void>;

  /**
   * Log out the current user.
   * Clears authentication state.
   */
  logout(): Promise<void>;

  /**
   * Initialize the authentication controller.
   * Called by NubaseApp on startup to check for existing sessions.
   * Should check for stored credentials/tokens and restore session if valid.
   */
  initialize(): Promise<void>;

  // Future extensibility - these are optional and can be added by implementations
  // socialLogin?(provider: 'google' | 'github' | 'microsoft'): Promise<void>;
  // forgotPassword?(email: string): Promise<void>;
  // resetPassword?(token: string, newPassword: string): Promise<void>;
  // verifyTwoFactor?(code: string): Promise<void>;
  // getSessions?(): Promise<Session[]>;
  // revokeSession?(sessionId: string): Promise<void>;
}
