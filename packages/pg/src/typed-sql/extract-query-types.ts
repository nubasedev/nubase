/**
 * Thin wrapper around the vendored pgtyped wire client's `startup()` +
 * `getTypes()` so the rest of the codebase can ask "what are the types of
 * this SQL query?" without knowing about wire-level details.
 *
 * Opens a connection per call, which is wasteful for many-query workloads.
 * The `generate-all` orchestrator (added later) will reuse one connection
 * for a whole generation run; this function exists for tests and one-shots.
 */

import { parseDatabaseUrl } from "./parse-database-url.js";
import type {
  InterpolatedQuery,
  IParseError,
  IQueryTypes,
} from "./query/actions.js";
import { getTypes, startup } from "./query/actions.js";
import { AsyncQueue } from "./wire/queue.js";

export interface ExtractOptions {
  databaseUrl: string;
  /** The SQL to parse. Must use native `$1`, `$2` placeholders — named params should already be rewritten. */
  sql: string;
  /** Optional mapping metadata passed through to `IQueryTypes`. */
  mapping?: InterpolatedQuery["mapping"];
}

export type ExtractResult = IQueryTypes | IParseError;

export async function extractQueryTypes(
  opts: ExtractOptions,
): Promise<ExtractResult> {
  const parsed = parseDatabaseUrl(opts.databaseUrl);
  const queue = new AsyncQueue();
  try {
    // Note: the vendored AsyncQueue treats any non-null `ssl` value as
    // "SSL enabled" (including `false`), so we omit the key entirely when
    // SSL is disabled rather than passing `ssl: false`.
    await startup(
      {
        host: parsed.host,
        port: parsed.port,
        user: parsed.user,
        password: parsed.password,
        dbName: parsed.dbName,
        ...(parsed.ssl ? { ssl: true } : {}),
      },
      queue,
    );
    const interp: InterpolatedQuery = {
      query: opts.sql,
      mapping: opts.mapping ?? [],
    };
    return await getTypes(interp, queue);
  } finally {
    // The vendored AsyncQueue exposes a `socket` property — close it so the
    // process doesn't linger on open sockets.
    try {
      queue.socket.end();
      queue.socket.destroy();
    } catch {
      // Best-effort; ignore teardown errors.
    }
  }
}
