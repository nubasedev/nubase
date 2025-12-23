---
sidebar_position: 11
---

# Authentication

This guide explains how to add authentication to your Nubase application. The authentication system is designed to be flexible and extensible, supporting username/password login with the architecture to add social login, 2FA, and SSO in the future.

## Overview

Nubase authentication works through controller interfaces on both frontend and backend:

- **Frontend `AuthenticationController`** - Manages login UI, state, and cookie handling
- **Backend `BackendAuthController`** - Handles JWT tokens, route protection, and user verification

This design allows you to:

- Connect to any backend authentication system
- Use secure HttpOnly cookies for token storage
- Protect backend routes with type-safe auth levels
- Add additional authentication methods as needed

## Quick Start

### 1. Create Your Frontend Authentication Controller

Create a class that implements the `AuthenticationController` interface:

```typescript
// src/auth/MyAuthController.ts
import type {
  AuthenticationController,
  AuthenticationState,
  AuthenticationStateListener,
  LoginCredentials,
} from "@nubase/frontend";

export class MyAuthController implements AuthenticationController {
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
    return () => this.listeners.delete(listener);
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
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Required for cookies
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();
      this.setState({
        status: "authenticated",
        user: data.user,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Login failed");
      this.setState({ status: "unauthenticated", user: null, error: err });
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
      // Logout errors are not critical
    }
    this.setState({ status: "unauthenticated", user: null, error: null });
  }

  async initialize(): Promise<void> {
    this.setState({ status: "loading", error: null });

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        this.setState({ status: "unauthenticated", user: null, error: null });
        return;
      }

      const data = await response.json();
      if (data.user) {
        this.setState({ status: "authenticated", user: data.user, error: null });
      } else {
        this.setState({ status: "unauthenticated", user: null, error: null });
      }
    } catch {
      this.setState({ status: "unauthenticated", user: null, error: null });
    }
  }
}
```

### 2. Configure Your Frontend Application

Pass the authentication controller to your `NubaseFrontendConfig`:

```typescript
// src/config.tsx
import type { NubaseFrontendConfig } from "@nubase/frontend";
import { MyAuthController } from "./auth/MyAuthController";

const apiBaseUrl = "http://localhost:3001";
const authController = new MyAuthController(apiBaseUrl);

export const config: NubaseFrontendConfig = {
  appName: "My App",
  mainMenu: [/* ... */],
  resources: {/* ... */},
  apiBaseUrl: apiBaseUrl,
  apiEndpoints: apiEndpoints,

  // Add authentication
  authentication: authController,
  publicRoutes: ["/signin"],  // Routes that don't require login
};
```

### 3. Create Your Backend Authentication Controller

Create a class that implements the `BackendAuthController` interface:

```typescript
// src/auth/MyBackendAuthController.ts
import type {
  BackendAuthController,
  BackendUser,
  TokenPayload,
  VerifyTokenResult,
} from "@nubase/backend";
import { getCookie } from "@nubase/backend";
import bcrypt from "bcrypt";
import type { Context } from "hono";
import jwt from "jsonwebtoken";

// Define your user type
interface MyUser extends BackendUser {
  id: number;
  email: string;
  username: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRY = "1h";
const COOKIE_NAME = "app_auth";

export class MyBackendAuthController implements BackendAuthController<MyUser> {
  extractToken(ctx: Context): string | null {
    const cookieHeader = ctx.req.header("Cookie") || "";
    return getCookie(cookieHeader, COOKIE_NAME);
  }

  async verifyToken(token: string): Promise<VerifyTokenResult<MyUser>> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await db.users.findById(decoded.userId);

      if (!user) {
        return { valid: false, error: "User not found" };
      }

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: "Token expired" };
      }
      return { valid: false, error: "Invalid token" };
    }
  }

  async createToken(user: MyUser): Promise<string> {
    return jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
  }

  setTokenInResponse(ctx: Context, token: string): void {
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600`
    );
  }

  clearTokenFromResponse(ctx: Context): void {
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
    );
  }

  async validateCredentials(username: string, password: string): Promise<MyUser | null> {
    const user = await db.users.findByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
}

// Export singleton instance
export const myAuthController = new MyBackendAuthController();
```

### 4. Set Up Backend Middleware and Routes

Apply the auth middleware and create auth routes using the `createAuthHandlers` utility:

```typescript
// src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuthHandlers, createAuthMiddleware } from "@nubase/backend";
import { myAuthController } from "./auth/MyBackendAuthController";

const app = new Hono();

// CORS - must come first
app.use(cors({
  origin: ["http://tavern.localhost:3002"],
  credentials: true,
}));

// Auth middleware - extracts and verifies JWT on all routes
app.use("*", createAuthMiddleware({ controller: myAuthController }));

// Create auth handlers from the controller
const authHandlers = createAuthHandlers({ controller: myAuthController });

// Mount auth routes - provides /auth/login, /auth/logout, /auth/me
app.route("/auth", authHandlers.routes);

// ... register other routes
```

The `createAuthHandlers` utility generates standard login, logout, and getMe handlers from your `BackendAuthController`. It uses the `validateCredentials` method you implemented to verify username/password during login.

**Alternative: Manual Handler Registration**

If you need more control over individual handlers, you can register them separately:

```typescript
app.post("/auth/login", authHandlers.login);
app.post("/auth/logout", authHandlers.logout);
app.get("/auth/me", authHandlers.getMe);
```

**Custom Auth Endpoints**

For completely custom auth logic, you can still create handlers manually:

```typescript
// src/api/routes/auth.ts
import { createHttpHandler, getAuthController, HttpError } from "@nubase/backend";
import { apiEndpoints } from "your-schema";

export const handleLogin = createHttpHandler({
  endpoint: apiEndpoints.login,
  handler: async ({ body, ctx }) => {
    const authController = getAuthController(ctx);

    // Custom credential validation
    const user = await authController.validateCredentials(body.username, body.password);
    if (!user) {
      throw new HttpError(401, "Invalid username or password");
    }

    // Create and set token
    const token = await authController.createToken(user);
    authController.setTokenInResponse(ctx, token);

    return { user };
  },
});
```

### 5. Protect Your Routes

Use the `auth` option in `createHttpHandler` to protect routes:

```typescript
// src/api/routes/tickets.ts
import { createHttpHandler } from "@nubase/backend";

// Protected route - returns 401 if not authenticated
export const handleGetTickets = createHttpHandler({
  endpoint: apiEndpoints.getTickets,
  auth: "required",
  handler: async ({ user }) => {
    // user is guaranteed to exist here
    console.log(`User ${user.username} fetching tickets`);
    return await fetchTicketsForUser(user.id);
  },
});

// Optional auth - user may be null
export const handleGetPublicContent = createHttpHandler({
  endpoint: apiEndpoints.getPublicContent,
  auth: "optional",
  handler: async ({ user }) => {
    if (user) {
      return { content: "personalized content", userId: user.id };
    }
    return { content: "generic content" };
  },
});

// No auth (default) - for public endpoints
export const handleHealthCheck = createHttpHandler({
  endpoint: apiEndpoints.healthCheck,
  // auth: "none" is the default
  handler: async () => {
    return { status: "ok" };
  },
});
```

## Configuration Options

### Frontend: publicRoutes

An array of route prefixes that don't require authentication:

```typescript
const config: NubaseFrontendConfig = {
  // ...
  publicRoutes: ["/signin", "/signup", "/forgot-password", "/public"],
};
```

Routes not in this list will automatically redirect to `/signin` when the user is not authenticated.

### Backend: Auth Levels

| Auth Level | Behavior | Handler user Type |
|------------|----------|-------------------|
| `"required"` | Returns 401 if not authenticated | `TUser` (guaranteed non-null) |
| `"optional"` | Allows both authenticated and unauthenticated | `TUser \| null` |
| `"none"` | No authentication check (default) | `null` |

## Using Authentication in Components

Access the authentication controller through the Nubase context:

```typescript
import { useNubaseContext } from "@nubase/frontend";

function MyComponent() {
  const { authentication } = useNubaseContext();

  const handleLogout = async () => {
    await authentication?.logout();
    // User will be redirected to /signin automatically
  };

  const user = authentication?.getState().user;

  return (
    <div>
      <p>Welcome, {user?.username}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## The Sign-In Page

Nubase provides a built-in sign-in page at `/signin`. It automatically:

- Connects to your authentication controller
- Shows loading states during login
- Displays error messages on failure
- Redirects to the home page on success

You can customize the sign-in experience by creating your own route if needed.

## Security Best Practices

1. **Use HttpOnly cookies** - Prevents JavaScript access to tokens, protecting against XSS
2. **Use secure cookies in production** - Add `Secure` flag when using HTTPS
3. **Set SameSite attribute** - Use `Lax` or `Strict` to prevent CSRF attacks
4. **Hash passwords properly** - Use bcrypt with a cost factor of 12 or higher
5. **Use short token expiry** - 1 hour is recommended, with refresh token support
6. **Configure CORS correctly** - Enable credentials and whitelist your frontend origin
7. **Use environment variables** - Never hardcode secrets in your code

## Future Extensibility

Both the frontend and backend controller interfaces are designed to support additional features:

### Frontend Extensions

```typescript
interface AuthenticationController {
  // Current methods
  login(credentials: LoginCredentials): Promise<void>;
  logout(): Promise<void>;
  initialize(): Promise<void>;
  getState(): AuthenticationState;
  subscribe(listener: AuthenticationStateListener): () => void;

  // Future methods (optional)
  // socialLogin?(provider: 'google' | 'github'): Promise<void>;
  // forgotPassword?(email: string): Promise<void>;
  // resetPassword?(token: string, newPassword: string): Promise<void>;
  // verifyTwoFactor?(code: string): Promise<void>;
}
```

### Backend Extensions

```typescript
interface BackendAuthController<TUser> {
  // Current required methods
  extractToken(ctx: Context): string | null;
  verifyToken(token: string): Promise<VerifyTokenResult<TUser>>;
  createToken(user: TUser): Promise<string>;
  setTokenInResponse(ctx: Context, token: string): void;
  clearTokenFromResponse(ctx: Context): void;
  validateCredentials(username: string, password: string): Promise<TUser | null>;

  // Optional methods for future features
  refreshToken?(token: string): Promise<string | null>;
  revokeToken?(token: string): Promise<void>;
  verify2FA?(userId: string | number, code: string): Promise<boolean>;
  requires2FA?(user: TUser): boolean;
  validateExternalToken?(provider: string, token: string): Promise<TUser | null>;
}
```

You can extend your controller implementations to add these methods as your application requirements grow.

## Next Steps

- [Schema System](./schema.md) - Define your user and session schemas
- [Resources](./resources.md) - Create user management resources
- [Internals: Authentication](./internals/authentication.md) - Understand the implementation details
