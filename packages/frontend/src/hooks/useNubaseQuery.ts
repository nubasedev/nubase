import {
  keepPreviousData,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import { useNubaseContext } from "../components/nubase-app/NubaseContextProvider";
import type { HttpResponse } from "../http/http-client";
import { isServerNetworkError } from "../utils/network-errors";

/**
 * Retry policy used by the resource-aware query hooks below:
 *
 *   - 4xx responses are the user's fault (validation, not found, forbidden,
 *     …). Retrying sends the same input and gets the same rejection, and
 *     for search queries the noisy retries keep `isFetching` toggling which
 *     in turn keeps the loading overlay flickering. Never retry 4xx.
 *   - Other failures (5xx, network outage) get one retry — search queries
 *     are idempotent and a single retry usually papers over a hiccup.
 *
 * Callers can still override via the `retry` option.
 */
function defaultResourceRetryPolicy(
  failureCount: number,
  error: unknown,
): boolean {
  if (isServerNetworkError(error) && error.isClientError()) return false;
  return failureCount < 1;
}

export interface UseNubaseQueryOptions<TData = any> {
  /**
   * Unique query key for this data fetching operation
   * Should include relevant parameters that affect the data
   */
  queryKey: readonly unknown[];

  /**
   * Function that returns a promise with the data
   * Should use the view's onLoad function or similar
   */
  queryFn: (context: any) => Promise<HttpResponse<TData>>;

  /**
   * Parameters that will be passed to the context
   */
  params?: Record<string, any>;

  /**
   * Standard React Query options
   */
  options?: Omit<UseQueryOptions<HttpResponse<TData>>, "queryKey" | "queryFn">;
}

/**
 * Custom hook that integrates React Query with Nubase's context and view system
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useNubaseQuery({
 *   queryKey: ['tickets', 'search', params],
 *   queryFn: (context) => view.onLoad({ context }),
 *   params: searchParams,
 *   options: {
 *     enabled: !!searchParams,
 *   }
 * });
 * ```
 */
export function useNubaseQuery<TData = any>({
  queryKey,
  queryFn,
  params,
  options = {},
}: UseNubaseQueryOptions<TData>) {
  const context = useNubaseContext();

  return useQuery({
    queryKey,
    queryFn: async () => {
      const contextWithParams = {
        ...context,
        params: params || undefined,
      };
      return queryFn(contextWithParams);
    },
    ...options,
  });
}

/**
 * Hook specifically designed for resource search views
 * Automatically generates query keys and integrates with the view pattern
 */
export function useResourceSearchQuery<TData = any>(
  resourceId: string,
  view: { onLoad: (args: { context: any }) => Promise<HttpResponse<TData>> },
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<HttpResponse<TData>>, "queryKey" | "queryFn">,
) {
  return useNubaseQuery({
    queryKey: ["resource", resourceId, "search", params],
    queryFn: (context) => view.onLoad({ context }),
    params,
    options: {
      // Keep previous data visible while fetching new data with different params
      // This prevents flickering when filters change - isLoading stays false, only isFetching is true
      placeholderData: keepPreviousData,
      retry: defaultResourceRetryPolicy,
      ...options,
    },
  });
}

/**
 * Hook specifically designed for resource view operations
 * Automatically generates query keys and integrates with the view pattern
 */
export function useResourceViewQuery<TData = any>(
  resourceId: string,
  view: { onLoad: (args: { context: any }) => Promise<HttpResponse<TData>> },
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<HttpResponse<TData>>, "queryKey" | "queryFn">,
) {
  return useNubaseQuery({
    queryKey: ["resource", resourceId, "view", params],
    queryFn: (context) => view.onLoad({ context }),
    params,
    options: {
      enabled: !!params, // Only fetch if we have the required params
      // Keep previous data visible while refetching so no spinner flashes when
      // invalidation triggers a background refresh (e.g. after a patch).
      placeholderData: keepPreviousData,
      retry: defaultResourceRetryPolicy,
      ...options,
    },
  });
}
