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
  /** Workspace slug for path-based multi-workspace */
  workspace?: string;
}

/**
 * Workspace info returned during two-step login.
 */
export interface WorkspaceInfo {
  id: number;
  slug: string;
  name: string;
}

/**
 * Response from login start (step 1 of two-step auth).
 */
export interface LoginStartResponse {
  /** Temporary token for completing login */
  loginToken: string;
  /** User's username */
  username: string;
  /** List of workspaces the user belongs to */
  workspaces: WorkspaceInfo[];
}

/**
 * Credentials for completing two-step login.
 */
export interface LoginCompleteCredentials {
  /** Temporary login token from login start */
  loginToken: string;
  /** Selected workspace slug */
  workspace: string;
}

/**
 * Signup credentials for creating new user and workspace.
 */
export interface SignupCredentials {
  workspace: string;
  workspaceName: string;
  username: string;
  email: string;
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

  /**
   * Start the two-step login process (optional).
   * Step 1: Validates credentials and returns list of workspaces user belongs to.
   * If not implemented, falls back to single-step login.
   */
  loginStart?(credentials: {
    username: string;
    password: string;
  }): Promise<LoginStartResponse>;

  /**
   * Complete the two-step login process (optional).
   * Step 2: Select a workspace and complete authentication.
   * If not implemented, falls back to single-step login.
   */
  loginComplete?(credentials: LoginCompleteCredentials): Promise<WorkspaceInfo>;

  /**
   * Sign up a new user and create a new workspace (optional).
   * Creates both the workspace and the initial admin user.
   */
  signup?(credentials: SignupCredentials): Promise<void>;

  // Future extensibility - these are optional and can be added by implementations
  // socialLogin?(provider: 'google' | 'github' | 'microsoft'): Promise<void>;
  // forgotPassword?(email: string): Promise<void>;
  // resetPassword?(token: string, newPassword: string): Promise<void>;
  // verifyTwoFactor?(code: string): Promise<void>;
  // getSessions?(): Promise<Session[]>;
  // revokeSession?(sessionId: string): Promise<void>;
}
