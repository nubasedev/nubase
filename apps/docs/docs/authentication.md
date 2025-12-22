---
sidebar_position: 11
---

# Authentication

This guide explains how to add authentication to your Nubase application. The authentication system is designed to be flexible and extensible, supporting username/password login with the architecture to add social login, forgot password, and other features in the future.

## Overview

Nubase authentication works through an `AuthenticationController` interface that you implement in your application. This design allows you to:

- Connect to any backend authentication system
- Use any token storage strategy (cookies, localStorage, etc.)
- Customize login/logout behavior
- Add additional authentication methods as needed

## Quick Start

### 1. Create Your Authentication Controller

Create a class that implements the `AuthenticationController` interface:

```typescript
// src/auth/MyAuthController.ts
import type {
  AuthenticationController,
  AuthenticationState,
  AuthenticationStateListener,
  LoginCredentials,
  AuthenticatedUser,
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

### 2. Configure Your Application

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

### 3. Set Up Backend Endpoints

Your backend needs three endpoints:

#### POST /auth/login

Validates credentials and sets an authentication cookie:

```typescript
// Request body
{ username: string; password: string }

// Response body
{ user: { id: number; email: string; username: string } }

// Also sets HttpOnly cookie with JWT token
```

#### POST /auth/logout

Clears the authentication cookie:

```typescript
// Response body
{ success: boolean }
```

#### GET /auth/me

Returns the current user from the cookie token:

```typescript
// Response body
{ user?: { id: number; email: string; username: string } }
```

## Configuration Options

### publicRoutes

An array of route prefixes that don't require authentication:

```typescript
const config: NubaseFrontendConfig = {
  // ...
  publicRoutes: ["/signin", "/signup", "/forgot-password", "/public"],
};
```

Routes not in this list will automatically redirect to `/signin` when the user is not authenticated.

### Default Behavior

- **Default public routes**: `["/signin"]`
- **Redirect target**: `/signin` (when unauthenticated)
- **Cookie handling**: Uses `credentials: "include"` for cross-origin requests

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

## Backend Implementation Example

Here's a complete backend implementation using Hono and JWT:

```typescript
// src/api/routes/auth.ts
import { createHttpHandler } from "@nubase/backend";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { apiEndpoints } from "your-schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret";
const COOKIE_NAME = "app_auth";

export const handleLogin = createHttpHandler({
  endpoint: apiEndpoints.login,
  handler: async ({ body, ctx }) => {
    // Find user in database
    const user = await findUserByUsername(body.username);
    if (!user) {
      throw new Error("Invalid username or password");
    }

    // Verify password
    const isValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid username or password");
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set HttpOnly cookie
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600`
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  },
});

export const handleLogout = createHttpHandler({
  endpoint: apiEndpoints.logout,
  handler: async ({ ctx }) => {
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
    );
    return { success: true };
  },
});

export const handleGetMe = createHttpHandler({
  endpoint: apiEndpoints.getMe,
  handler: async ({ ctx }) => {
    const cookieHeader = ctx.req.header("Cookie") || "";
    const token = parseCookies(cookieHeader)[COOKIE_NAME];

    if (!token) {
      return { user: undefined };
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await findUserById(decoded.userId);

      if (!user) {
        return { user: undefined };
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch {
      return { user: undefined };
    }
  },
});
```

## Security Best Practices

1. **Use HttpOnly cookies** - Prevents JavaScript access to tokens, protecting against XSS
2. **Use secure cookies in production** - Add `Secure` flag when using HTTPS
3. **Set SameSite attribute** - Use `Lax` or `Strict` to prevent CSRF attacks
4. **Hash passwords properly** - Use bcrypt with a cost factor of 12 or higher
5. **Use short token expiry** - 1 hour is recommended, with refresh token support
6. **Configure CORS correctly** - Enable credentials and whitelist your frontend origin

## Future Extensibility

The `AuthenticationController` interface is designed to support additional features:

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

You can extend your controller implementation to add these methods as your application requirements grow.

## Next Steps

- [Schema System](./schema.md) - Define your user and session schemas
- [Resources](./resources.md) - Create user management resources
- [Internals: Authentication](./internals/authentication.md) - Understand the implementation details
