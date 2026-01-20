import type { Lookup } from "@nubase/core";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import type { ResourceLookupConfig } from "../../../../config/resource";
import { LookupSelect } from "../../../form-controls/controls/LookupSelect/LookupSelect";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";
import type { EditFieldLifecycle } from "../../FormFieldRenderer/renderer-factory";
import type { EditFieldRendererProps, EditFieldRendererResult } from "../types";

export const LookupEditFieldRenderer = ({
  schema,
  fieldState,
  hasError,
  metadata,
}: EditFieldRendererProps): EditFieldRendererResult => {
  const context = useNubaseContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the resource lookup configuration
  const lookupResourceId = metadata.lookupResource;

  // Get the resource from the config (may be undefined)
  const resource = lookupResourceId
    ? (context.config.resources?.[lookupResourceId] as
        | { lookup?: ResourceLookupConfig }
        | undefined)
    : undefined;

  // Get the lookup configuration from the resource (may be undefined)
  const lookupConfig = resource?.lookup;

  // Fetch initial item when we have a value but no display text
  const { data: initialItem } = useQuery({
    queryKey: ["lookup-initial", lookupResourceId, fieldState.state.value],
    queryFn: async (): Promise<Lookup | null> => {
      if (!lookupConfig?.onSearch || fieldState.state.value == null) {
        return null;
      }
      // Search with empty string to get items, then find by ID
      const response = await lookupConfig.onSearch({
        query: "",
        context,
      });
      return response.data.find((r) => r.id === fieldState.state.value) || null;
    },
    enabled: fieldState.state.value != null && !!lookupConfig?.onSearch,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Create the search handler - must be called unconditionally
  const handleSearch = useCallback(
    async (query: string): Promise<Lookup[]> => {
      if (!lookupConfig?.onSearch) {
        return [];
      }

      try {
        const response = await lookupConfig.onSearch({
          query,
          context,
        });
        return response.data;
      } catch (error) {
        console.error("Lookup search failed:", error);
        return [];
      }
    },
    [lookupConfig, context],
  );

  // Use useRef to keep the same lifecycle object across renders.
  // PatchWrapper's useEffect sets onValueCommit on this object, so we need
  // a stable reference that persists across renders.
  const lifecycleRef = useRef<EditFieldLifecycle>({
    onEnterEdit: () => {
      setTimeout(() => {
        if (containerRef.current) {
          const input = containerRef.current.querySelector("input");
          if (input) {
            input.focus();
          }
        }
      }, 0);
    },
  });
  const lifecycle = lifecycleRef.current;

  // Handle error cases after all hooks have been called
  if (!lookupResourceId) {
    return {
      element: (
        <div className="text-destructive text-sm">
          Error: lookupResource not specified in field metadata
        </div>
      ),
      lifecycle,
      autoCommit: true,
    };
  }

  if (!resource) {
    return {
      element: (
        <div className="text-destructive text-sm">
          Error: Resource "{lookupResourceId}" not found in config
        </div>
      ),
      lifecycle,
      autoCommit: true,
    };
  }

  if (!lookupConfig) {
    return {
      element: (
        <div className="text-destructive text-sm">
          Error: Resource "{lookupResourceId}" does not have lookup configured
        </div>
      ),
      lifecycle,
      autoCommit: true,
    };
  }

  // Coerce the value to the expected type based on schema.baseType
  const coerceValue = (
    value: string | number | null,
  ): string | number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    // If the schema expects a number, convert string to number
    if (schema.baseType === "number") {
      const numValue = typeof value === "string" ? Number(value) : value;
      return Number.isNaN(numValue) ? null : numValue;
    }
    // Otherwise return as-is (string)
    return value;
  };

  const element = (
    <LookupSelect
      ref={containerRef}
      onSearch={handleSearch}
      value={fieldState.state.value}
      onChange={(value) => {
        fieldState.handleChange(coerceValue(value));
      }}
      onItemSelect={(item) => {
        // Pass the coerced value directly to onValueCommit to avoid race conditions
        // where React state hasn't updated yet when the patch reads fieldState.state.value
        const coercedValue = item ? coerceValue(item.id) : null;
        lifecycle.onValueCommit?.(coercedValue);
      }}
      placeholder={metadata.description || `Search ${lookupResourceId}...`}
      hasError={hasError}
      minQueryLength={lookupConfig.minQueryLength ?? 1}
      debounceMs={lookupConfig.debounceMs ?? 300}
      initialItem={initialItem ?? undefined}
    />
  );

  return { element, lifecycle, autoCommit: true };
};
