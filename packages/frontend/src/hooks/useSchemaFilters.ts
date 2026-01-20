import { type ObjectSchema, SEARCH_FIELD_NAME } from "@nubase/core";
import { useCallback, useMemo, useState } from "react";
import { introspectSchemaForFilters } from "../components/schema-filter-bar/introspect-schema";
import type {
  FilterFieldDescriptor,
  SchemaFilterConfig,
  SchemaFilterState,
} from "../components/schema-filter-bar/types";

export type UseSchemaFiltersOptions = SchemaFilterConfig;

export type UseSchemaFiltersReturn<TSchema extends ObjectSchema<any>> = {
  /** Current filter values */
  filterState: SchemaFilterState<TSchema>;

  /** Update a single filter value */
  setFilterValue: (field: string, value: unknown) => void;

  /** Update multiple filter values at once */
  setFilterValues: (values: Partial<SchemaFilterState<TSchema>>) => void;

  /** Clear all filters */
  clearFilters: () => void;

  /** Whether any filters are active */
  hasActiveFilters: boolean;

  /** Filter field descriptors for rendering */
  filterDescriptors: FilterFieldDescriptor[];

  /** Get params for API call (removes empty/undefined values) */
  getRequestParams: () => Record<string, unknown>;

  /** Global search value (if schema has "q" field) */
  searchValue: string;

  /** Update global search value */
  setSearchValue: (value: string) => void;

  /** Whether the schema supports global text search (has "q" field) */
  hasTextSearch: boolean;
};

/**
 * Hook for managing schema-derived filter state.
 *
 * @param schema The ObjectSchema to derive filters from (typically endpoint.requestParams)
 * @param options Optional configuration for filtering and customization
 * @returns Filter state and methods for managing filters
 *
 * @example
 * ```typescript
 * const filterSchema = apiEndpoints.getTickets.requestParams;
 * const {
 *   filterState,
 *   setFilterValue,
 *   clearFilters,
 *   hasActiveFilters,
 *   filterDescriptors,
 *   getRequestParams,
 * } = useSchemaFilters(filterSchema);
 *
 * // Use getRequestParams() for API calls
 * const { data } = useQuery({
 *   queryKey: ["tickets", getRequestParams()],
 *   queryFn: () => api.getTickets({ params: getRequestParams() }),
 * });
 * ```
 */
export function useSchemaFilters<TSchema extends ObjectSchema<any>>(
  schema: TSchema | undefined,
  options?: UseSchemaFiltersOptions,
): UseSchemaFiltersReturn<TSchema> {
  // Check if schema supports global text search (has search field)
  const hasTextSearch = useMemo(() => {
    if (!schema) return false;
    return SEARCH_FIELD_NAME in schema._shape;
  }, [schema]);

  // Introspect schema to get filter descriptors
  // Note: "q" is excluded from introspection in introspect-schema.ts
  const filterDescriptors = useMemo(() => {
    if (!schema) return [];
    return introspectSchemaForFilters(schema, options);
  }, [schema, options]);

  // Filter state management
  const [filterState, setFilterState] = useState<SchemaFilterState<TSchema>>(
    {} as SchemaFilterState<TSchema>,
  );

  // Global search state (separate from field filters)
  const [searchValue, setSearchValueState] = useState("");

  // Update global search value
  const setSearchValue = useCallback((value: string) => {
    setSearchValueState(value);
  }, []);

  // Update a single filter value
  const setFilterValue = useCallback((field: string, value: unknown) => {
    setFilterState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Update multiple filter values at once
  const setFilterValues = useCallback(
    (values: Partial<SchemaFilterState<TSchema>>) => {
      setFilterState((prev) => ({
        ...prev,
        ...values,
      }));
    },
    [],
  );

  // Clear all filters (including search)
  const clearFilters = useCallback(() => {
    setFilterState({} as SchemaFilterState<TSchema>);
    setSearchValueState("");
  }, []);

  // Check if any filters are active (including search)
  const hasActiveFilters = useMemo(() => {
    // Check if search value is active
    if (searchValue.trim() !== "") {
      return true;
    }

    // Check if any field filters are active
    return Object.entries(filterState).some(([, value]) => {
      if (value === undefined || value === null || value === "") {
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    });
  }, [filterState, searchValue]);

  // Get params for API call (removes empty/undefined values, includes search)
  const getRequestParams = useCallback((): Record<string, unknown> => {
    const params: Record<string, unknown> = {};

    // Include global search if present
    if (searchValue.trim() !== "") {
      params[SEARCH_FIELD_NAME] = searchValue.trim();
    }

    for (const [key, value] of Object.entries(filterState)) {
      // Skip empty values
      if (value === undefined || value === null || value === "") {
        continue;
      }
      // Skip empty arrays
      if (Array.isArray(value) && value.length === 0) {
        continue;
      }
      params[key] = value;
    }

    return params;
  }, [filterState, searchValue]);

  return {
    filterState,
    setFilterValue,
    setFilterValues,
    clearFilters,
    hasActiveFilters,
    filterDescriptors,
    getRequestParams,
    searchValue,
    setSearchValue,
    hasTextSearch,
  };
}
