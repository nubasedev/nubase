import type { Lookup } from "@nubase/core";
import { useQuery } from "@tanstack/react-query";
import type { ResourceLookupConfig } from "../../../../config/resource";
import { ActivityIndicator } from "../../../activity-indicator/ActivityIndicator";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";
import type { ViewFieldRendererProps } from "../types";

/**
 * View renderer for lookup fields.
 * Fetches and displays the referenced entity's display text using the lookup endpoint.
 */
export const LookupViewFieldRenderer = ({
  fieldState,
  metadata,
}: ViewFieldRendererProps) => {
  const context = useNubaseContext();
  const value = fieldState.state.value;

  // Get the resource lookup configuration
  const lookupResourceId = metadata.lookupResource;

  // Get the resource from the config (with type cast for lookup access)
  const resource = lookupResourceId
    ? (context.config.resources?.[lookupResourceId] as
        | { lookup?: ResourceLookupConfig }
        | undefined)
    : null;

  // Get the lookup configuration from the resource
  const lookupConfig = resource?.lookup;

  // Get the endpoint key for the lookup
  const endpointKey = lookupConfig?.endpoint as string | undefined;

  // Query to fetch the item for display
  const { data: lookupItem, isLoading } = useQuery({
    queryKey: ["lookup-display", lookupResourceId, value],
    queryFn: async (): Promise<Lookup | null> => {
      if (!endpointKey || !context.http || value == null) {
        return null;
      }

      try {
        // Call the lookup endpoint with the value as query
        // This will search for items matching the ID
        const httpMethod = (context.http as Record<string, unknown>)[
          endpointKey
        ] as
          | ((args: { params: { q: string } }) => Promise<{ data: Lookup[] }>)
          | undefined;

        if (!httpMethod) {
          return null;
        }

        // Search with empty string to get all items, then find by ID
        // Note: This is not ideal but works for small datasets
        // In production, you might want a dedicated "get by ID" endpoint
        const response = await httpMethod({ params: { q: "" } });
        const item = response.data.find((r) => r.id === value);
        return item || null;
      } catch {
        return null;
      }
    },
    enabled: value != null && !!endpointKey && !!context.http,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Handle missing configuration
  if (!lookupResourceId) {
    return (
      <span className="text-muted-foreground">{value ?? "Not selected"}</span>
    );
  }

  if (!resource || !lookupConfig) {
    return <span className="text-muted-foreground">{value ?? "-"}</span>;
  }

  // Handle empty value
  if (value == null) {
    return <span className="text-muted-foreground">Not selected</span>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <span className="flex items-center gap-2 text-muted-foreground">
        <ActivityIndicator size="xs" />
        Loading...
      </span>
    );
  }

  // Display with avatar if available
  if (lookupItem) {
    return (
      <span className="flex items-center gap-2">
        {lookupItem.image && (
          <img
            src={lookupItem.image}
            alt={lookupItem.title}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
        )}
        <span>
          {lookupItem.title}
          {lookupItem.subtitle && (
            <span className="text-muted-foreground text-sm ml-1">
              ({lookupItem.subtitle})
            </span>
          )}
        </span>
      </span>
    );
  }

  // Fallback to showing just the ID
  return <span>{value}</span>;
};
