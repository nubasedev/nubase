import type { Lookup } from "@nubase/core";
import { useQuery } from "@tanstack/react-query";
import type { ResourceLookupConfig } from "../../../config/resource";
import { ActivityIndicator } from "../../activity-indicator/ActivityIndicator";
import { useNubaseContext } from "../../nubase-app/NubaseContextProvider";
import type { ViewFieldRendererProps } from "../types";
import { EmptyValue, ViewFieldWrapper } from "../ViewFieldWrapper";

/**
 * View renderer for lookup fields.
 * Fetches and displays the referenced entity's display text using the lookup callback.
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

  // Query to fetch the item for display
  const { data: lookupItem, isLoading } = useQuery({
    queryKey: ["lookup-display", lookupResourceId, value],
    queryFn: async (): Promise<Lookup | null> => {
      if (!lookupConfig?.onSearch || value == null) {
        return null;
      }

      try {
        // Search with empty string to get all items, then find by ID
        // Note: This is not ideal but works for small datasets
        // In production, you might want a dedicated "get by ID" endpoint
        const response = await lookupConfig.onSearch({
          query: "",
          context,
        });
        const item = response.data.find((r) => r.id === value);
        return item || null;
      } catch {
        return null;
      }
    },
    enabled: value != null && !!lookupConfig?.onSearch,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Handle missing configuration
  if (!lookupResourceId) {
    return (
      <ViewFieldWrapper variant="singleLine">
        {value ?? <EmptyValue />}
      </ViewFieldWrapper>
    );
  }

  if (!resource || !lookupConfig) {
    return (
      <ViewFieldWrapper variant="singleLine">
        {value ?? <EmptyValue />}
      </ViewFieldWrapper>
    );
  }

  // Handle empty value
  if (value == null) {
    return (
      <ViewFieldWrapper variant="singleLine">
        <EmptyValue />
      </ViewFieldWrapper>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <ViewFieldWrapper variant="singleLine">
        <span className="flex items-center gap-2 text-muted-foreground">
          <ActivityIndicator size="xs" />
          Loading...
        </span>
      </ViewFieldWrapper>
    );
  }

  // Display with avatar if available
  if (lookupItem) {
    return (
      <ViewFieldWrapper variant="singleLine">
        <span className="flex items-center gap-2">
          {lookupItem.image && (
            <img
              src={lookupItem.image}
              alt={lookupItem.title}
              className="w-6 h-6 rounded-full object-cover shrink-0"
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
      </ViewFieldWrapper>
    );
  }

  // Fallback to showing just the ID
  return <ViewFieldWrapper variant="singleLine">{value}</ViewFieldWrapper>;
};
