import type { DatabaseClient } from "./database-client.js";
import type { EntityMap } from "./entity.js";

// ---------------------------------------------------------------------------
// Custom endpoint types
// ---------------------------------------------------------------------------

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface EndpointContext<TEntities extends EntityMap> {
  user: { id: number; email: string; displayName: string };
  workspace: { id: number; slug: string };
  db: DatabaseClient<TEntities>;
  log: (...args: unknown[]) => void;
  request: {
    params: Record<string, string>;
    query: Record<string, string>;
    body: unknown;
    headers: Record<string, string>;
  };
}

export interface EndpointDefinition<TEntities extends EntityMap> {
  method: HttpMethod;
  path: string;
  handler: (ctx: EndpointContext<TEntities>) => Promise<unknown> | unknown;
}

/**
 * Custom endpoints config. Keys are endpoint names, values define method, path, and handler.
 * Mounted at `/api/custom/<path>` on the server.
 */
export type EndpointsConfig<TEntities extends EntityMap> = Record<
  string,
  EndpointDefinition<TEntities>
>;
