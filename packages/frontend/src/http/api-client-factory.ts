import type { createTypedApiClient } from "./typed-api-client";

/**
 * Type helper to extract the typed API client type from an endpoints definition.
 * Supports both flat and nested endpoint structures.
 */
export type TypedApiClientFromEndpoints<T> = ReturnType<
  typeof createTypedApiClient<T>
>;
