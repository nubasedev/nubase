import type { Lookup } from "@nubase/core";
import { useCallback, useRef } from "react";
import type { ResourceLookupConfig } from "../../../../config/resource";
import { LookupSelect } from "../../../form-controls/controls/LookupSelect/LookupSelect";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";
import type { EditFieldLifecycle } from "../../FormFieldRenderer/renderer-factory";
import type { EditFieldRendererProps, EditFieldRendererResult } from "../types";

export const LookupEditFieldRenderer = ({
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

  // Get the endpoint key for the lookup
  const endpointKey = lookupConfig?.endpoint as string | undefined;

  // Create the search handler - must be called unconditionally
  const handleSearch = useCallback(
    async (query: string): Promise<Lookup[]> => {
      if (!endpointKey || !context.http) {
        return [];
      }

      try {
        // Call the lookup endpoint with the query parameter
        const httpMethod = (context.http as Record<string, unknown>)[
          endpointKey
        ] as
          | ((args: { params: { q: string } }) => Promise<{ data: Lookup[] }>)
          | undefined;

        if (!httpMethod) {
          console.error(`Lookup endpoint "${endpointKey}" not found`);
          return [];
        }

        const response = await httpMethod({ params: { q: query } });
        return response.data;
      } catch (error) {
        console.error("Lookup search failed:", error);
        return [];
      }
    },
    [endpointKey, context.http],
  );

  const lifecycle: EditFieldLifecycle = {
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
  };

  // Handle error cases after all hooks have been called
  if (!lookupResourceId) {
    return {
      element: (
        <div className="text-destructive text-sm">
          Error: lookupResource not specified in field metadata
        </div>
      ),
      lifecycle,
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
    };
  }

  const element = (
    <LookupSelect
      ref={containerRef}
      onSearch={handleSearch}
      value={fieldState.state.value}
      onChange={(value) => {
        fieldState.handleChange(value);
      }}
      placeholder={metadata.description || `Search ${lookupResourceId}...`}
      hasError={hasError}
      minQueryLength={lookupConfig.minQueryLength ?? 1}
      debounceMs={lookupConfig.debounceMs ?? 300}
    />
  );

  return { element, lifecycle };
};
