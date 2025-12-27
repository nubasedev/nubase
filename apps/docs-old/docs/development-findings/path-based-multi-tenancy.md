# Path-Based Multi-Tenancy Migration

This document describes the migration from subdomain-based tenant isolation (e.g., `tavern.localhost:3002`) to path-based tenant isolation (e.g., `localhost:3002/tavern/...`), similar to how Shortcut handles tenancy (`app.shortcut.com/anglio/iterations`).

## Motivation

Subdomain-based tenancy required complex DNS configuration for deployments (e.g., wildcard subdomains in Coolify). Path-based tenancy simplifies deployment while maintaining the same security guarantees.

## Architecture Changes

### Frontend Changes

1. **Route Structure**: All routes are now nested under `/$tenant`:
   - `/tavern/` - tenant index
   - `/tavern/r/ticket/create` - resource operations
   - `/tavern/signin` - authentication

2. **TenantContext**: A React context provides the current tenant slug to components:
   ```typescript
   // context/TenantContext.tsx
   export function useTenant(): TenantContext {
     const context = useContext(TenantContextValue);
     if (!context) {
       throw new Error("useTenant must be used within /$tenant route");
     }
     return context;
   }
   ```

3. **Circular Dependency Prevention**: The tenant context was moved to a separate file (`context/TenantContext.tsx`) to avoid circular imports between route definitions and components.

### Backend Changes

1. **Tenant Identification**: The backend no longer extracts tenant from the Host header. Instead, the tenant is:
   - Provided in the login request body (for initial authentication)
   - Embedded in the JWT token (for subsequent requests)

2. **Middleware Chain**:
   ```typescript
   app.use("*", createTenantMiddleware());      // Handles login path
   app.use("*", createAuthMiddleware(...));     // Verifies JWT
   app.use("*", createPostAuthTenantMiddleware()); // Sets RLS from user.tenantId
   ```

3. **Login Flow**: The login endpoint now accepts `tenant` in the request body:
   ```typescript
   requestBody: nu.object({
     username: nu.string(),
     password: nu.string(),
     tenant: nu.string(),  // Added for path-based tenancy
   }),
   ```

## Critical Implementation Details

### Cookie Configuration for Cross-Origin Requests

When frontend (port 3002) and backend (port 3001) run on different ports, cookies require specific settings:

```typescript
// QuestlogBackendAuthController.ts
setTokenInResponse(ctx: Context, token: string): void {
  ctx.header(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=3600`,
  );
}
```

**Key settings:**
- `SameSite=None`: Required for cross-origin requests
- `Secure`: Required when `SameSite=None` (localhost is treated as secure by browsers)
- `HttpOnly`: Prevents JavaScript access (XSS protection)

### RLS Context Timing Issue

**Problem**: With subdomain tenancy, RLS context was set from the Host header *before* authentication. With path-based tenancy, the tenant comes from the JWT token, creating a chicken-and-egg problem:

```
Subdomain flow:
1. Tenant middleware → Extract from Host header → SET RLS
2. Auth middleware → Verify JWT, lookup user (RLS already set!)

Path-based flow:
1. Tenant middleware → No tenant available yet
2. Auth middleware → Verify JWT, lookup user (RLS NOT set!)
3. Post-auth middleware → Set RLS from user.tenantId
```

**Solution**: The `verifyToken()` method must use `getAdminDb()` (bypasses RLS) instead of `getDb()` when looking up users during authentication:

```typescript
async verifyToken(token: string): Promise<VerifyTokenResult<QuestlogUser>> {
  const decoded = jwt.verify(token, JWT_SECRET) as QuestlogTokenPayload;

  // Use adminDb to bypass RLS since RLS context isn't set yet during auth
  const adminDb = getAdminDb();
  const users = await adminDb
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, decoded.userId));

  // ... rest of verification
}
```

This is safe because:
1. We're only checking if the user exists, not accessing tenant-scoped data
2. The JWT itself contains `tenantId` which is verified
3. Actual tenant-scoped data access happens in handlers *after* RLS context is set

## File Changes Summary

### Frontend (`packages/frontend`)
- `src/context/TenantContext.tsx` - New file for tenant context (avoids circular deps)
- `src/routes/root.tsx` - Added tenant route, re-exports tenant hooks
- `src/routes/routes.ts` - Nested all routes under `tenantRoute`
- `src/routes/signin/signin-route.tsx` - Factory function to avoid circular deps
- `src/routes/signin/signin-screen.tsx` - Passes tenant to login
- `src/index.tsx` - Updated exports

### Backend (`examples/questlog/backend`)
- `src/auth/QuestlogBackendAuthController.ts` - Updated cookie settings, use adminDb
- `src/middleware/tenant-middleware.ts` - Added post-auth middleware
- `src/api/routes/auth.ts` - Get tenant from request body for login

### Schema (`examples/questlog/schema`)
- `src/schema/auth.ts` - Added `tenant` field to login schema

## Testing

After making these changes:
1. Restart both frontend and backend servers
2. Clear browser cookies for localhost
3. Navigate to `http://localhost:3002/tavern`
4. Login should work and subsequent API requests should be authenticated

## Debugging Tips

Add logging to the auth middleware to trace issues:

```typescript
console.info(`[Auth] ${c.req.method} ${c.req.path} - Cookie: ${cookieHeader ? "present" : "none"}`);
console.info(`[Auth] Token extracted: ${token ? "yes" : "no"}`);
console.info(`[Auth] Token verification: ${result.valid ? "valid" : result.error}`);
```

Common issues:
- **"User not found"**: Check if `verifyToken` is using `getAdminDb()` instead of `getDb()`
- **401 Unauthorized**: Check if cookies have `SameSite=None; Secure` settings
- **Cookie not sent**: Ensure frontend HTTP client uses `withCredentials: true`
