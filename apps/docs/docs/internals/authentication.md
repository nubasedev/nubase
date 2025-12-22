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
```

The authentication system is designed as an optional layer. When no `AuthenticationController` is provided in the config, all routes are accessible without login.

## Core Types

### AuthenticationController Interface

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

## Configuration Integration

### NubaseFrontendConfig

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

### Context Exposure

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

## Route Architecture

### Route Tree Structure

The route system (`packages/frontend/src/routes/`) uses a two-level layout:

```
rootRoute (RootComponent)
├── signinRoute (SignInScreen) - public, minimal layout
└── appShellRoute (AppShellComponent) - protected, full layout
    ├── indexRoute
    ├── resourceRoute
    └── viewRoute
```

### RootComponent: The Auth Gate

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

### Why Auth Logic Lives in RootComponent

Early implementations attempted to wrap the `RouterProvider` with an `AuthenticationProvider` component. This failed because router hooks (`useLocation`, `useNavigate`) require being inside the router context.

The solution: place auth logic in `RootComponent`, which is rendered by the router and has full access to both router hooks and the Nubase context.

### AppShellComponent: Protected Layout

Routes requiring authentication nest under `appShellRoute`:

```typescript
function AppShellComponent() {
  const context = useNubaseContext();

  return (
    <Dock
      top={<TopBar context={context} />}
      left={<MainNav items={context.config.mainMenu} />}
      center={<Outlet />}
    />
  );
}

export const appShellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-shell",
  component: AppShellComponent,
});
```

This separation ensures:
- Public routes (signin) render with minimal layout
- Protected routes render with full app shell (navigation, top bar)
- Authentication checks happen at the root level before any child renders

## Sign-In Screen

### Component Implementation

`packages/frontend/src/routes/signin/signin-screen.tsx`:

```typescript
export const SignInScreen: FC = () => {
  const { authentication } = useNubaseContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      if (!authentication) return;
      setIsLoading(true);
      setError(null);
      try {
        await authentication.login(value);
        navigate({ to: "/" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // ... render form
};
```

### Route Definition

```typescript
export const signinRoute = createRoute({
  getParentRoute: () => rootRoute,  // Direct child of root, not appShell
  path: "/signin",
  component: SignInScreen,
});
```

By making `signinRoute` a direct child of `rootRoute` (not `appShellRoute`), it bypasses the app shell layout entirely.

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

## Backend Integration

### Expected Endpoints

The authentication system expects these backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login` | POST | Validate credentials, set HttpOnly cookie |
| `/auth/logout` | POST | Clear authentication cookie |
| `/auth/me` | GET | Return current user from cookie token |

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
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,  // Required for cookies
  }),
);
```

```typescript
// Frontend fetch calls
fetch(url, {
  credentials: "include",  // Required to send/receive cookies
});
```

## Implementing a Controller

### Minimal Implementation Pattern

```typescript
class MyAuthController implements AuthenticationController {
  private state: AuthenticationState = {
    status: "loading",
    user: null,
    error: null,
  };
  private listeners = new Set<AuthenticationStateListener>();

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
    // ... implementation
  }

  async logout(): Promise<void> {
    // ... implementation
    this.setState({ status: "unauthenticated", user: null, error: null });
  }

  async initialize(): Promise<void> {
    this.setState({ status: "loading", error: null });
    // Check existing session (e.g., call /auth/me)
    // ... implementation
  }
}
```

### State Transitions

| Current Status | Action | New Status |
|---------------|--------|------------|
| `loading` | `initialize()` succeeds with user | `authenticated` |
| `loading` | `initialize()` succeeds without user | `unauthenticated` |
| `unauthenticated` | `login()` succeeds | `authenticated` |
| `unauthenticated` | `login()` fails | `unauthenticated` (with error) |
| `authenticated` | `logout()` | `unauthenticated` |

## Loading States

The `RootComponent` shows loading indicators during:

1. **Initialization**: While `authentication.initialize()` is running
2. **Redirect Pending**: After determining redirect is needed, before navigation completes

```typescript
if (authentication) {
  if (!isInitialized || authState?.status === "loading") {
    return <ActivityIndicator size="lg" aria-label="Loading..." />;
  }

  if (authState?.status === "unauthenticated" && !isPublicRoute) {
    return <ActivityIndicator size="lg" aria-label="Redirecting..." />;
  }
}
```

## Extensibility Points

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

To add social login:
1. Add optional `socialLogin` method to the interface
2. Implement in concrete controller
3. Add UI buttons to SignInScreen that detect method availability

## File Reference

| File | Purpose |
|------|---------|
| `packages/frontend/src/authentication/types.ts` | Core type definitions |
| `packages/frontend/src/authentication/index.ts` | Public exports |
| `packages/frontend/src/config/nubase-frontend-config.ts` | Config type with auth fields |
| `packages/frontend/src/context/types.ts` | Context type with auth field |
| `packages/frontend/src/routes/root.tsx` | Route protection logic |
| `packages/frontend/src/routes/signin/signin-screen.tsx` | Sign-in UI component |
| `packages/frontend/src/routes/signin/signin-route.tsx` | Sign-in route definition |
| `packages/frontend/src/routes/routes.ts` | Route tree assembly |

## Security Considerations

1. **Token Storage**: Always use HttpOnly cookies, never localStorage
2. **HTTPS in Production**: Set `Secure` flag on cookies
3. **CSRF Protection**: Use `SameSite=Lax` or `SameSite=Strict`
4. **Short Token Expiry**: Prefer 1-hour tokens with refresh capability
5. **Password Hashing**: Backend should use bcrypt with cost factor 12+
