/**
 * Parse a `postgresql://` (or `postgres://`) URL into the shape expected by
 * the vendored pgtyped wire client's `startup()`.
 *
 * Supports:
 * - `postgres://user:pass@host:port/dbname`
 * - `postgres://user@host/dbname` (no password, default port 5432)
 * - `postgres://host/dbname` (no user — `user` is required by the wire
 *   protocol, so we throw)
 * - `sslmode=require` / `sslmode=disable` query parameters
 *
 * This is intentionally minimal — we only parse what the wire client needs.
 * Unknown query parameters are ignored.
 */
export interface ParsedDatabaseUrl {
  host: string;
  port: number;
  user: string;
  password?: string;
  dbName: string;
  /**
   * `true` when `sslmode=require` / `sslmode=verify-full` etc.
   * `false` when `sslmode=disable` or omitted.
   *
   * We stay binary (boolean) because the wire client's `connect()` takes
   * `boolean | tls.ConnectionOptions` and we don't surface cert pinning.
   */
  ssl: boolean;
}

const DEFAULT_PORT = 5432;

export function parseDatabaseUrl(raw: string): ParsedDatabaseUrl {
  let url: URL;
  try {
    url = new URL(raw);
  } catch (_e) {
    throw new Error(
      `Invalid database URL: ${raw}. Expected postgres://user:pass@host:port/dbname`,
    );
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error(
      `Invalid database URL protocol: ${url.protocol}. Expected postgres:// or postgresql://`,
    );
  }

  const host = url.hostname;
  if (!host) {
    throw new Error(`Database URL missing host: ${raw}`);
  }

  const port = url.port ? Number.parseInt(url.port, 10) : DEFAULT_PORT;
  if (Number.isNaN(port)) {
    throw new Error(`Database URL has invalid port: ${url.port}`);
  }

  // URL.username/password are percent-encoded; decode them.
  const user = url.username ? decodeURIComponent(url.username) : "";
  if (!user) {
    throw new Error(
      `Database URL missing user. Expected postgres://user:pass@host:port/dbname, got ${raw}`,
    );
  }

  const password = url.password ? decodeURIComponent(url.password) : undefined;

  // Strip the leading slash from the pathname to get the database name.
  const dbName = url.pathname.replace(/^\//, "");
  if (!dbName) {
    throw new Error(
      `Database URL missing database name. Expected postgres://user:pass@host:port/dbname, got ${raw}`,
    );
  }

  const sslmode = url.searchParams.get("sslmode");
  const ssl = sslmode !== null && sslmode !== "disable";

  return { host, port, user, password, dbName, ssl };
}
