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
