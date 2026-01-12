import type { BaseSchema, Lookup } from "@nubase/core";
import { useCallback, useRef } from "react";
import type { ResourceLookupConfig } from "../../../../config/resource";
import { LookupSelect } from "../../../form-controls/controls/LookupSelect/LookupSelect";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";
import type { EditFieldLifecycle } from "../../FormFieldRenderer/renderer-factory";
import type { EditFieldRendererProps, EditFieldRendererResult } from "../types";

/**
 * Helper to get the base type from a schema, unwrapping optional wrappers.
 * Returns the `type` property of the innermost schema.
 */
function getBaseSchemaType(schema: BaseSchema<any>): string {
  // Check if the schema has an 'unwrap' method (OptionalSchema)
  if ("unwrap" in schema && typeof schema.unwrap === "function") {
    return getBaseSchemaType(schema.unwrap());
  }
  // Return the type of the schema
  return (schema as any).type || "unknown";
}

export const LookupEditFieldRenderer = ({
  schema,
  fieldState,
  hasError,
  metadata,
}: EditFieldRendererProps): EditFieldRendererResult => {
  const context = useNubaseContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine the expected type of the field value
  const expectedType = getBaseSchemaType(schema);

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

  // Coerce the value to the expected type
  const coerceValue = (
    value: string | number | null,
  ): string | number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    // If the schema expects a number, convert string to number
    if (expectedType === "number") {
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
      placeholder={metadata.description || `Search ${lookupResourceId}...`}
      hasError={hasError}
      minQueryLength={lookupConfig.minQueryLength ?? 1}
      debounceMs={lookupConfig.debounceMs ?? 300}
    />
  );

  return { element, lifecycle };
};
