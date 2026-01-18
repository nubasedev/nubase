import {
  keepPreviousData,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import { useNubaseContext } from "../components/nubase-app/NubaseContextProvider";
import type { HttpResponse } from "../http/http-client";

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
      ...options,
    },
  });
}
