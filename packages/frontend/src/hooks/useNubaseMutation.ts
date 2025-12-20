import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNubaseContext } from "../components/nubase-app/NubaseContextProvider";
import type { HttpResponse } from "../http/http-client";

export interface UseNubaseMutationOptions<TData = any, TVariables = any> {
  /**
   * Function that performs the mutation
   * Should use the view's onSubmit function or similar
   */
  mutationFn: (
    variables: TVariables,
    context: any,
  ) => Promise<HttpResponse<TData>>;

  /**
   * Query keys to invalidate after successful mutation
   * Can be a string pattern or array of exact keys
   */
  invalidateQueries?: (string | readonly unknown[])[];

  /**
   * Standard React Query mutation options
   */
  options?: Omit<
    UseMutationOptions<HttpResponse<TData>, Error, TVariables>,
    "mutationFn"
  >;
}

/**
 * Custom hook that integrates React Query mutations with Nubase's context system
 * Automatically handles query invalidation after successful mutations
 *
 * @example
 * ```typescript
 * const createTicketMutation = useNubaseMutation({
 *   mutationFn: (data, context) => view.onSubmit({ data, context }),
 *   invalidateQueries: [
 *     ['resource', 'ticket', 'search'],
 *     ['resource', 'ticket', 'view']
 *   ],
 *   options: {
 *     onSuccess: (data) => {
 *       showToast('Ticket created successfully', 'success');
 *     }
 *   }
 * });
 * ```
 */
export function useNubaseMutation<TData = any, TVariables = any>({
  mutationFn,
  invalidateQueries = [],
  options = {},
}: UseNubaseMutationOptions<TData, TVariables>) {
  const context = useNubaseContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      return mutationFn(variables, context);
    },
    onSuccess: async (data, variables, onMutateResult, mutationContext) => {
      // Invalidate specified queries
      for (const queryKey of invalidateQueries) {
        if (typeof queryKey === "string") {
          // If it's a string, treat it as a query key pattern
          await queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey[0];
              return typeof key === "string" && key.includes(queryKey);
            },
          });
        } else {
          // If it's an array, treat it as an exact query key
          await queryClient.invalidateQueries({ queryKey });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        await options.onSuccess(
          data,
          variables,
          onMutateResult,
          mutationContext,
        );
      }
    },
    ...options,
  });
}

/**
 * Hook specifically designed for resource creation operations
 * Automatically invalidates related resource queries
 */
export function useResourceCreateMutation<TData = any, TVariables = any>(
  resourceId: string,
  view: {
    onSubmit: (args: {
      data: TVariables;
      context: any;
    }) => Promise<HttpResponse<TData>>;
  },
  options?: Omit<
    UseMutationOptions<HttpResponse<TData>, Error, TVariables>,
    "mutationFn"
  >,
) {
  return useNubaseMutation({
    mutationFn: (data, context) => view.onSubmit({ data, context }),
    invalidateQueries: [
      ["resource", resourceId, "search"],
      ["resource", resourceId, "view"],
    ],
    options,
  });
}

/**
 * Hook specifically designed for resource update/patch operations
 * Automatically invalidates related resource queries
 */
export function useResourceUpdateMutation<TData = any, TVariables = any>(
  resourceId: string,
  view: {
    onPatch: (args: {
      data: TVariables;
      context: any;
    }) => Promise<HttpResponse<TData>>;
  },
  options?: Omit<
    UseMutationOptions<HttpResponse<TData>, Error, TVariables>,
    "mutationFn"
  >,
) {
  return useNubaseMutation({
    mutationFn: (data, context) => view.onPatch({ data, context }),
    invalidateQueries: [
      ["resource", resourceId, "search"],
      ["resource", resourceId, "view"],
    ],
    options,
  });
}

/**
 * Hook specifically designed for resource deletion operations
 * Automatically invalidates related resource queries
 */
export function useResourceDeleteMutation<TData = any, TVariables = any>(
  _resourceId: string,
  view: {
    onDelete: (args: {
      data: TVariables;
      context: any;
    }) => Promise<HttpResponse<TData>>;
  },
  options?: Omit<
    UseMutationOptions<HttpResponse<TData>, Error, TVariables>,
    "mutationFn"
  >,
) {
  return useNubaseMutation({
    mutationFn: (data, context) => view.onDelete({ data, context }),
    invalidateQueries: [], // We use manual invalidation in the component
    options,
  });
}

/**
 * Hook for invalidating specific resource queries manually
 * Useful for custom invalidation scenarios
 */
export function useResourceInvalidation() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidate all queries for a specific resource
     */
    invalidateResource: async (resourceId: string) => {
      await queryClient.invalidateQueries({
        queryKey: ["resource", resourceId],
      });
    },

    /**
     * Invalidate search queries for a specific resource
     */
    invalidateResourceSearch: async (resourceId: string) => {
      // Use predicate to match queries that start with ["resource", resourceId, "search"]
      // This will match both 3-element and 4-element (with params) keys
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key.length >= 3 &&
            key[0] === "resource" &&
            key[1] === resourceId &&
            key[2] === "search"
          );
        },
      });
    },

    /**
     * Invalidate view queries for a specific resource
     */
    invalidateResourceView: async (
      resourceId: string,
      params?: Record<string, any>,
    ) => {
      await queryClient.invalidateQueries({
        queryKey: ["resource", resourceId, "view", params],
      });
    },

    /**
     * Invalidate all queries matching a pattern
     */
    invalidateByPattern: async (pattern: string) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === "string" && key.includes(pattern);
        },
      });
    },
  };
}
