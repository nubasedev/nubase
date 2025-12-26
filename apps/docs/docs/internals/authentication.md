# Authentication Internals

This document explains how Nubase implements authentication at the framework level. It covers the internal architecture, state management, route protection, and the integration points between frontend and backend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  NubaseApp                                                  │ │
│  │    └─ ServicesProvider                                      │ │
│  │         └─ NubaseContextProvider (exposes authentication)   │ │
│  │              └─ RouterProvider                              │ │
│  │                   └─ RootComponent (auth logic lives here)  │ │
│  │                        ├─ AppShellRoute (protected)         │ │
│  │                        │    └─ Dock + TopBar + MainNav      │ │
│  │                        └─ SignInRoute (public)              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP (cookies)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Backend                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Hono App                                                   │ │
│  │    └─ CORS Middleware                                       │ │
│  │         └─ Auth Middleware (extracts user from JWT cookie)  │ │
│  │              ├─ Public Routes (auth: 'none')                │ │
│  │              │    └─ /auth/login, /auth/logout              │ │
│  │              └─ Protected Routes (auth: 'required')         │ │
│  │                   └─ /tickets, /api/...                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

The authentication system is designed as an optional layer. When no `AuthenticationController` is provided in the config, all routes are accessible without login.

## Frontend Authentication

### Core Types

#### AuthenticationController Interface

Defined in `packages/frontend/src/authentication/types.ts`:

```typescript
export interface AuthenticatedUser {
  id: number;
  email: string;
  username: string;
}

export interface AuthenticationState {
  status: "loading" | "authenticated" | "unauthenticated";
  user: AuthenticatedUser | null;
  error: Error | null;
}

export type AuthenticationStateListener = (state: AuthenticationState) => void;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthenticationController {
  getState(): AuthenticationState;
  subscribe(listener: AuthenticationStateListener): () => void;
  login(credentials: LoginCredentials): Promise<void>;
  logout(): Promise<void>;
  initialize(): Promise<void>;
}
```

The interface follows a listener/subscriber pattern similar to Redux stores, allowing reactive UI updates when authentication state changes.

### Configuration Integration

#### NubaseFrontendConfig

The authentication controller is passed via the app configuration (`packages/frontend/src/config/nubase-frontend-config.ts`):

```typescript
export type NubaseFrontendConfig = {
  // ... other fields
  authentication?: AuthenticationController;
  publicRoutes?: string[];
};
```

- `authentication`: The controller instance (optional)
- `publicRoutes`: Route prefixes that don't require authentication (defaults to `["/signin"]`)

#### Context Exposure

The controller is exposed through `NubaseContextData` (`packages/frontend/src/context/types.ts`):

```typescript
export interface NubaseContextData {
  // ... other fields
  authentication: AuthenticationController | null;
}
```

Components access authentication via `useNubaseContext()`:

```typescript
const { authentication } = useNubaseContext();
const user = authentication?.getState().user;
```

### Route Architecture

#### Route Tree Structure

The route system (`packages/frontend/src/routes/`) uses a two-level layout:

```
rootRoute (RootComponent)
├── signinRoute (SignInScreen) - public, minimal layout
└── appShellRoute (AppShellComponent) - protected, full layout
    ├── indexRoute
    ├── resourceRoute
    └── viewRoute
```

#### RootComponent: The Auth Gate

`packages/frontend/src/routes/root.tsx` contains all authentication logic:

```typescript
function RootComponent() {
  const { authentication, config } = useNubaseContext();
  const publicRoutes = config.publicRoutes ?? ["/signin"];
  const location = useLocation();
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<AuthenticationState | null>(
    authentication?.getState() ?? null,
  );
  const [isInitialized, setIsInitialized] = useState(!authentication);

  // 1. Initialize authentication on mount
  useEffect(() => {
    if (!authentication) return;
    const init = async () => {
      try {
        await authentication.initialize();
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, [authentication]);

  // 2. Subscribe to auth state changes
  useEffect(() => {
    if (!authentication) return;
    const unsubscribe = authentication.subscribe((state) => {
      setAuthState(state);
    });
    return unsubscribe;
  }, [authentication]);

  // 3. Handle redirection for unauthenticated users
  useEffect(() => {
    if (!authentication || !isInitialized || !authState) return;
    if (authState.status === "loading") return;

    const currentPath = location.pathname;
    const isPublicRoute = publicRoutes.some((route) =>
      currentPath.startsWith(route),
    );

    if (authState.status === "unauthenticated" && !isPublicRoute) {
      navigate({ to: "/signin" });
    }
  }, [authentication, authState, isInitialized, location.pathname, navigate, publicRoutes]);

  // ... loading states and render
}
```

#### Why Auth Logic Lives in RootComponent

Early implementations attempted to wrap the `RouterProvider` with an `AuthenticationProvider` component. This failed because router hooks (`useLocation`, `useNavigate`) require being inside the router context.

The solution: place auth logic in `RootComponent`, which is rendered by the router and has full access to both router hooks and the Nubase context.

## Backend Authentication

### Core Types

Defined in `packages/backend/src/auth/types.ts`:

#### BackendUser

Base type for authenticated users. Applications extend this with additional fields:

```typescript
export interface BackendUser {
  id: number | string;
}
```

#### TokenPayload

JWT payload structure:

```typescript
export interface TokenPayload {
  userId: number | string;
  iat?: number;  // Issued at
  exp?: number;  // Expiration
}
```

#### AuthLevel

Authentication requirement level for routes:

```typescript
export type AuthLevel = "required" | "optional" | "none";
```

- `required`: Returns 401 if not authenticated. Handler receives guaranteed non-null user.
- `optional`: Authentication optional. Handler receives user or null.
- `none`: No authentication check. Handler receives null user. (default)

#### BackendAuthController Interface

The main abstraction for backend authentication:

```typescript
export interface BackendAuthController<
  TUser extends BackendUser = BackendUser,
  TTokenPayload extends TokenPayload = TokenPayload,
> {
  // Required methods
  extractToken(ctx: Context): string | null;
  verifyToken(token: string): Promise<VerifyTokenResult<TUser>>;
  createToken(user: TUser, additionalPayload?: Partial<TTokenPayload>): Promise<string>;
  setTokenInResponse(ctx: Context, token: string): void;
  clearTokenFromResponse(ctx: Context): void;
  validateCredentials(username: string, password: string): Promise<TUser | null>;

  // Optional methods for future extensibility
  refreshToken?(token: string): Promise<string | null>;
  revokeToken?(token: string): Promise<void>;
  verify2FA?(userId: number | string, code: string): Promise<boolean>;
  requires2FA?(user: TUser): boolean;
  validateExternalToken?(provider: string, token: string): Promise<TUser | null>;
  linkExternalProvider?(userId: number | string, provider: string, externalId: string): Promise<void>;
  createSession?(user: TUser): Promise<string>;
  invalidateSession?(sessionId: string): Promise<void>;
}
```

### Auth Middleware

The middleware (`packages/backend/src/auth/middleware.ts`) extracts and verifies tokens:

```typescript
import { createAuthMiddleware } from "@nubase/backend";

// Apply to all routes
app.use("*", createAuthMiddleware({ controller: authController }));
```

The middleware:
1. Extracts the token from the request (typically from cookies)
2. Verifies the token using the controller
3. Sets the user in the Hono context (`c.get('user')`)
4. Makes the controller available in context (`c.get('authController')`)

### Auth Handlers Utility

The `createAuthHandlers` utility (`packages/backend/src/auth/handlers.ts`) generates standard authentication handlers from a `BackendAuthController`:

```typescript
import { createAuthHandlers, createAuthMiddleware } from "@nubase/backend";

const authController = new MyBackendAuthController();
const authHandlers = createAuthHandlers({ controller: authController });

const app = new Hono();
app.use("*", createAuthMiddleware({ controller: authController }));

// Option 1: Mount the pre-configured router
app.route("/auth", authHandlers.routes);

// Option 2: Register routes individually
app.post("/auth/login", authHandlers.login);
app.post("/auth/logout", authHandlers.logout);
app.get("/auth/me", authHandlers.getMe);
```

The utility returns:

| Handler | Route | Description |
|---------|-------|-------------|
| `login` | POST /login | Validates credentials via `validateCredentials()`, creates token, sets cookie |
| `logout` | POST /logout | Clears the auth cookie |
| `getMe` | GET /me | Returns current user or `{ user: undefined }` |
| `routes` | - | Pre-configured Hono router with all three routes |

This reduces boilerplate by encapsulating the standard login/logout/getMe pattern. Applications only need to implement the `BackendAuthController` interface.

### Route Protection with createHttpHandler

Routes specify their authentication requirements via the `auth` option. Export handlers as an object for auto-registration with `registerHandlers`:

```typescript
import { createHttpHandler } from "@nubase/backend";

export const ticketHandlers = {
  // Protected route - user is guaranteed non-null
  getTickets: createHttpHandler<
    typeof apiEndpoints.getTickets,
    "required",
    QuestlogUser
  >({
    endpoint: apiEndpoints.getTickets,
    auth: "required",
    handler: async ({ user }) => {
      console.log(`User ${user.username} fetching tickets`);
      // user is guaranteed to exist here
      return await fetchTickets();
    },
  }),
};

export const authHandlers = {
  // Optional auth - user may be null
  getMe: createHttpHandler<
    typeof apiEndpoints.getMe,
    "optional",
    QuestlogUser
  >({
    endpoint: apiEndpoints.getMe,
    auth: "optional",
    handler: async ({ user }) => {
      if (!user) {
        return { user: undefined };
      }
      return { user };
    },
  }),

  // No auth required (default)
  login: createHttpHandler({
    endpoint: apiEndpoints.login,
    // auth: "none" is the default
    handler: async ({ body, ctx }) => {
      // Login logic...
    },
  }),
};

// In index.ts:
// registerHandlers(app, ticketHandlers);
// registerHandlers(app, authHandlers);
```

### Backend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Auth Flow                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Request arrives                                                 │
│      │                                                           │
│      ▼                                                           │
│  CORS Middleware                                                 │
│      │                                                           │
│      ▼                                                           │
│  Auth Middleware (createAuthMiddleware)                          │
│      │                                                           │
│      ├─── extractToken(ctx) ───► Cookie: nubase_auth=<JWT>       │
│      │                                                           │
│      ├─── verifyToken(token) ───► Decode JWT + DB lookup         │
│      │         │                                                 │
│      │         ├─── Valid ───► c.set('user', user)               │
│      │         │                                                 │
│      │         └─── Invalid ───► c.set('user', null)             │
│      │                                                           │
│      ▼                                                           │
│  Route Handler (createHttpHandler)                               │
│      │                                                           │
│      ├─── auth: 'required' ───► user null? Return 401            │
│      │                                                           │
│      ├─── auth: 'optional' ───► Pass user (may be null)          │
│      │                                                           │
│      └─── auth: 'none' ───► Pass null user                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Helper Functions

```typescript
import { getUser, getAuthController } from "@nubase/backend";

// In a handler
const user = getUser<QuestlogUser>(ctx);
const authController = getAuthController<QuestlogUser>(ctx);

// Use controller for token operations
const token = await authController.createToken(user);
authController.setTokenInResponse(ctx, token);
```

## Full Stack Integration

### Expected Endpoints

The authentication system expects these backend endpoints:

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login` | POST | none | Validate credentials, set HttpOnly cookie |
| `/auth/logout` | POST | none | Clear authentication cookie |
| `/auth/me` | GET | optional | Return current user from cookie token |
| `/tickets` | GET | required | Example protected endpoint |

### Cookie-Based Authentication

The design uses HttpOnly cookies rather than localStorage for several reasons:

1. **XSS Protection**: JavaScript cannot access HttpOnly cookies, preventing token theft via XSS attacks
2. **Automatic Inclusion**: Cookies are automatically sent with requests when `credentials: "include"` is set
3. **Server-Side Control**: Cookie expiry and invalidation are controlled server-side

### CORS Configuration

For cookie-based auth to work cross-origin:

```typescript
// Backend (Hono example)
app.use(
  cors({
    origin: ["http://tavern.localhost:3002", "http://tavern.localhost:4002"],
    credentials: true,  // Required for cookies
  }),
);
```

```typescript
// Frontend HTTP client (packages/frontend/src/http/http-client.ts)
const response = await axios({
  url: fullUrl,
  method,
  data,
  withCredentials: true,  // Required to send/receive cookies
});
```

## Implementing Controllers

### Frontend AuthenticationController

```typescript
class MyAuthController implements AuthenticationController {
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
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error("Invalid credentials");
      const data = await response.json();
      this.setState({ status: "authenticated", user: data.user, error: null });
    } catch (error) {
      this.setState({ status: "unauthenticated", user: null, error: error as Error });
      throw error;
    }
  }

  async logout(): Promise<void> {
    await fetch(`${this.apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    this.setState({ status: "unauthenticated", user: null, error: null });
  }

  async initialize(): Promise<void> {
    this.setState({ status: "loading", error: null });
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          this.setState({ status: "authenticated", user: data.user, error: null });
          return;
        }
      }
      this.setState({ status: "unauthenticated", user: null, error: null });
    } catch {
      this.setState({ status: "unauthenticated", user: null, error: null });
    }
  }
}
```

### Backend BackendAuthController

```typescript
import type { BackendAuthController, VerifyTokenResult } from "@nubase/backend";
import { getCookie } from "@nubase/backend";
import type { Context } from "hono";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface MyUser extends BackendUser {
  id: number;
  email: string;
  username: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRY = "1h";
const COOKIE_NAME = "nubase_auth";

class MyBackendAuthController implements BackendAuthController<MyUser> {
  extractToken(ctx: Context): string | null {
    const cookieHeader = ctx.req.header("Cookie") || "";
    return getCookie(cookieHeader, COOKIE_NAME);
  }

  async verifyToken(token: string): Promise<VerifyTokenResult<MyUser>> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await db.users.findById(decoded.userId);
      if (!user) return { valid: false, error: "User not found" };
      return { valid: true, user };
    } catch (error) {
      return { valid: false, error: "Invalid token" };
    }
  }

  async createToken(user: MyUser): Promise<string> {
    return jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });
  }

  setTokenInResponse(ctx: Context, token: string): void {
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600`,
    );
  }

  clearTokenFromResponse(ctx: Context): void {
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
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
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  App Mount                                                       │
│      │                                                           │
│      ▼                                                           │
│  RootComponent renders                                           │
│      │                                                           │
│      ▼                                                           │
│  authentication.initialize() called                              │
│      │                                                           │
│      ├──────────────────────────────────────┐                    │
│      ▼                                      ▼                    │
│  Cookie valid?                         No cookie                 │
│      │                                      │                    │
│      ▼                                      ▼                    │
│  status: "authenticated"              status: "unauthenticated"  │
│  user: { id, email, username }        user: null                 │
│      │                                      │                    │
│      ▼                                      ▼                    │
│  Render app shell                     Redirect to /signin        │
│                                             │                    │
│                                             ▼                    │
│                                       User submits form          │
│                                             │                    │
│                                             ▼                    │
│                                       authentication.login()     │
│                                             │                    │
│                                             ├──────────┐         │
│                                             ▼          ▼         │
│                                       Success      Failure       │
│                                             │          │         │
│                                             ▼          ▼         │
│                                       Navigate to /  Show error  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Extensibility Points

### Frontend Extensions

The `AuthenticationController` interface is designed for future expansion:

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
  // refreshToken?(): Promise<void>;
}
```

### Backend Extensions

The `BackendAuthController` interface includes optional methods for:

- **Token Refresh**: `refreshToken?(token: string): Promise<string | null>`
- **Token Revocation**: `revokeToken?(token: string): Promise<void>`
- **2FA**: `verify2FA?(userId, code)` and `requires2FA?(user)`
- **Social Login/SSO**: `validateExternalToken?(provider, token)` and `linkExternalProvider?(userId, provider, externalId)`
- **Session Management**: `createSession?(user)` and `invalidateSession?(sessionId)`

To add social login:
1. Add the optional method to your controller implementation
2. Create endpoints for OAuth callback handling
3. Add UI buttons to SignInScreen that detect method availability

## File Reference

### Frontend

| File | Purpose |
|------|---------|
| `packages/frontend/src/authentication/types.ts` | Core type definitions |
| `packages/frontend/src/authentication/index.ts` | Public exports |
| `packages/frontend/src/config/nubase-frontend-config.ts` | Config type with auth fields |
| `packages/frontend/src/context/types.ts` | Context type with auth field |
| `packages/frontend/src/routes/root.tsx` | Route protection logic |
| `packages/frontend/src/routes/signin/signin-screen.tsx` | Sign-in UI component |
| `packages/frontend/src/routes/signin/signin-route.tsx` | Sign-in route definition |
| `packages/frontend/src/http/http-client.ts` | HTTP client with credentials support |

### Backend

| File | Purpose |
|------|---------|
| `packages/backend/src/auth/types.ts` | BackendAuthController interface and types |
| `packages/backend/src/auth/middleware.ts` | Hono auth middleware |
| `packages/backend/src/auth/handlers.ts` | createAuthHandlers utility for generating auth endpoints |
| `packages/backend/src/auth/index.ts` | Public exports |
| `packages/backend/src/typed-handlers.ts` | createHttpHandler with auth support |

### Example Implementation

| File | Purpose |
|------|---------|
| `questlog-example-app/frontend/src/auth/QuestlogAuthController.ts` | Frontend controller implementation |
| `questlog-example-app/backend/src/auth/QuestlogBackendAuthController.ts` | Backend controller implementation |
| `questlog-example-app/backend/src/api/routes/auth.ts` | Auth endpoints (login, logout, me) |
| `questlog-example-app/backend/src/api/routes/ticket.ts` | Protected endpoints example |

## Security Considerations

1. **Token Storage**: Always use HttpOnly cookies, never localStorage
2. **HTTPS in Production**: Set `Secure` flag on cookies
3. **CSRF Protection**: Use `SameSite=Lax` or `SameSite=Strict`
4. **Short Token Expiry**: Prefer 1-hour tokens with refresh capability
5. **Password Hashing**: Backend should use bcrypt with cost factor 12+
6. **Cross-Origin Requests**: Ensure `withCredentials: true` in HTTP client and `credentials: true` in CORS config
