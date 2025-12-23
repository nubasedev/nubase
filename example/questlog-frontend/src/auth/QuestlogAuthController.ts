import type {
  AuthenticatedUser,
  AuthenticationController,
  AuthenticationState,
  AuthenticationStateListener,
  LoginCredentials,
} from "@nubase/frontend";

/**
 * Questlog-specific implementation of AuthenticationController.
 * Communicates with the questlog-backend auth endpoints using HttpOnly cookies.
 */
export class QuestlogAuthController implements AuthenticationController {
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
      // Include tenant in the login request body for path-based multi-tenancy
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          tenant: credentials.tenant,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Invalid username or password");
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
}
