/**
 * Parse a cookie header string into a key-value object.
 *
 * @param cookieHeader - The Cookie header string (e.g., "name=value; other=123")
 * @returns An object mapping cookie names to their values
 *
 * @example
 * ```typescript
 * const cookies = parseCookies("session=abc123; theme=dark");
 * // { session: "abc123", theme: "dark" }
 * ```
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...rest] = cookie.split("=");
    if (name) {
      cookies[name.trim()] = rest.join("=").trim();
    }
  }

  return cookies;
}

/**
 * Get a specific cookie value from a cookie header string.
 *
 * @param cookieHeader - The Cookie header string
 * @param name - The cookie name to retrieve
 * @returns The cookie value or null if not found
 *
 * @example
 * ```typescript
 * const session = getCookie("session=abc123; theme=dark", "session");
 * // "abc123"
 * ```
 */
export function getCookie(cookieHeader: string, name: string): string | null {
  const cookies = parseCookies(cookieHeader);
  return cookies[name] ?? null;
}
