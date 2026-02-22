import type {
  AuthenticatedUser,
  AuthenticationController,
  AuthenticationState,
  AuthenticationStateListener,
  LoginCompleteCredentials,
  LoginCredentials,
  LoginStartResponse,
  SignupCredentials,
  WorkspaceInfo,
} from "@nubase/frontend";

/**
 * Nubase-specific implementation of AuthenticationController.
 * Communicates with the nubase-backend auth endpoints using HttpOnly cookies.
 */
export class NubaseAuthController implements AuthenticationController {
  private state: AuthenticationState = {
    status: "loading",
    user: null,
    error: null,
  };

  private listeners = new Set<AuthenticationStateListener>();
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  getState(): AuthenticationState {
    return this.state;
  }

  subscribe(listener: AuthenticationStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(newState: Partial<AuthenticationState>): void {
    this.state = { ...this.state, ...newState };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  async login(credentials: LoginCredentials): Promise<void> {
    this.setState({ status: "loading", error: null });

    try {
      // Include workspace in the login request body for path-based multi-workspace
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          workspace: credentials.workspace,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Invalid email or password");
      }

      const data = await response.json();
      const user: AuthenticatedUser = data.user;

      this.setState({
        status: "authenticated",
        user,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Login failed");
      this.setState({
        status: "unauthenticated",
        user: null,
        error: err,
      });
      throw err;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Logout errors are not critical - clear local state anyway
    }

    this.setState({
      status: "unauthenticated",
      user: null,
      error: null,
    });
  }

  async initialize(): Promise<void> {
    this.setState({ status: "loading", error: null });

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        this.setState({
          status: "unauthenticated",
          user: null,
          error: null,
        });
        return;
      }

      const data = await response.json();

      if (data.user) {
        this.setState({
          status: "authenticated",
          user: data.user,
          error: null,
        });
      } else {
        this.setState({
          status: "unauthenticated",
          user: null,
          error: null,
        });
      }
    } catch {
      // Network error or server unavailable - treat as unauthenticated
      this.setState({
        status: "unauthenticated",
        user: null,
        error: null,
      });
    }
  }

  /**
   * Start the two-step login process.
   * Step 1: Validates credentials and returns list of workspaces user belongs to.
   */
  async loginStart(credentials: {
    email: string;
    password: string;
  }): Promise<LoginStartResponse> {
    const response = await fetch(`${this.apiBaseUrl}/auth/login/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Invalid email or password");
    }

    return response.json();
  }

  /**
   * Complete the two-step login process.
   * Step 2: Select a workspace and complete authentication.
   */
  async loginComplete(
    credentials: LoginCompleteCredentials,
  ): Promise<WorkspaceInfo> {
    this.setState({ status: "loading", error: null });

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          loginToken: credentials.loginToken,
          workspace: credentials.workspace,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      const user: AuthenticatedUser = data.user;

      this.setState({
        status: "authenticated",
        user,
        error: null,
      });

      return data.workspace;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Login failed");
      this.setState({
        status: "unauthenticated",
        user: null,
        error: err,
      });
      throw err;
    }
  }

  /**
   * Sign up a new user and create a new workspace.
   * After successful signup, the user is automatically logged in.
   */
  async signup(credentials: SignupCredentials): Promise<void> {
    this.setState({ status: "loading", error: null });

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Signup failed");
      }

      const data = await response.json();
      const user: AuthenticatedUser = data.user;

      this.setState({
        status: "authenticated",
        user,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Signup failed");
      this.setState({
        status: "unauthenticated",
        user: null,
        error: err,
      });
      throw err;
    }
  }
}
