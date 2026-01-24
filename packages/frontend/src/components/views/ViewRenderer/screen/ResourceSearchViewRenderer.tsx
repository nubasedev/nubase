import type { BaseSchema, ObjectSchema, TableLayoutField } from "@nubase/core";
import { OptionalSchema } from "@nubase/core";
import { useNavigate } from "@tanstack/react-router";
import type { FC } from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type {
  ActionOrSeparator,
  HandlerAction,
  ResourceAction,
} from "../../../../actions/types";
import type { ActionLayout } from "../../../../config/action-layout";
import type { ResourceDescriptor } from "../../../../config/resource";
import type { ResourceSearchView } from "../../../../config/view";
import { ResourceContextProvider } from "../../../../context/ResourceContext";
import { useWorkspace } from "../../../../context/WorkspaceContext";
import { useResourceSearchQuery } from "../../../../hooks/useNubaseQuery";
import { useSchemaFilters } from "../../../../hooks/useSchemaFilters";
import { ActivityIndicator } from "../../../activity-indicator";
import { ActionBar } from "../../../buttons/ActionBar/ActionBar";
import { createActionColumn, SelectColumn } from "../../../data-grid/Columns";
import { DataGrid } from "../../../data-grid/DataGrid";
import {
  createPatchableColumn,
  type PatchResult,
} from "../../../data-grid/patching";
import type { Column } from "../../../data-grid/types";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";
import { SchemaFilterBar as SchemaFilterBarBase } from "../../../schema-filter-bar";

// Memoize SchemaFilterBar to prevent re-renders when parent re-renders due to query state changes
const SchemaFilterBar = memo(SchemaFilterBarBase);

// Default column widths based on field types
const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  number: 100, // For IDs, counts, prices
  boolean: 80, // Compact for yes/no, checkmarks
  string: 200, // General text fields
  object: 250, // Complex data
  array: 200, // Lists
  optional: 200, // Will use the wrapped type's width
};

// Get default width for a field based on its schema type
const getDefaultColumnWidth = (fieldSchema: BaseSchema<any>): number => {
  // Handle optional schemas by unwrapping
  if (fieldSchema instanceof OptionalSchema) {
    return getDefaultColumnWidth(fieldSchema.unwrap());
  }

  // Return width based on schema type or default fallback
  return DEFAULT_COLUMN_WIDTHS[fieldSchema.type] || 150;
};

// Helper function to resolve action layouts to actual actions
const resolveActionLayout = (
  actionLayout: ActionLayout<string> | undefined,
  resourceActions: Record<string, any> | undefined,
): ActionOrSeparator[] => {
  if (!actionLayout || !resourceActions) return [];

  return actionLayout
    .map((actionId) => {
      if (actionId === "separator") return "separator";
      return resourceActions[actionId];
    })
    .filter(Boolean); // Remove any undefined actions
};

export type ResourceSearchViewRendererProps = {
  view: ResourceSearchView;
  params?: Record<string, any>;
  resourceName?: string;
  resource?: ResourceDescriptor;
  onError?: (error: Error) => void;
};

export const ResourceSearchViewRenderer: FC<ResourceSearchViewRendererProps> = (
  props,
) => {
  const { view, params, resourceName, resource, onError } = props;
  const navigate = useNavigate();
  const context = useNubaseContext();
  const workspace = useWorkspace();

  // Schema-derived filter state management
  const {
    filterState,
    setFilterValue,
    clearFilters,
    hasActiveFilters,
    filterDescriptors,
    getRequestParams,
    searchValue,
    setSearchValue,
    hasTextSearch,
  } = useSchemaFilters(view.schemaFilter);

  // Merge URL params with filter state for the query
  const mergedParams = useMemo(() => {
    const filterParams = getRequestParams();
    return { ...params, ...filterParams };
  }, [params, getRequestParams]);

  // Create a function to wrap actions with automatic query invalidation
  const wrapActionsWithInvalidation = useCallback(
    (actions: ActionOrSeparator[]): ActionOrSeparator[] => {
      return actions.map((action) => {
        if (action === "separator") {
          return action;
        }

        if (action.type === "handler") {
          // Wrap handler actions with query invalidation
          const wrappedAction: HandlerAction = {
            ...action,
            onExecute: async (executionContext) => {
              // Execute the original action
              await action.onExecute(executionContext);

              // After successful execution, invalidate the search query to refresh the list
              if (resourceName && context.queryClient) {
                // Use predicate to match queries that start with ["resource", resourceName, "search"]
                // This will match both 3-element and 4-element (with params) keys
                await context.queryClient.invalidateQueries({
                  predicate: (query) => {
                    const key = query.queryKey;
                    return (
                      Array.isArray(key) &&
                      key.length >= 3 &&
                      key[0] === "resource" &&
                      key[1] === resourceName &&
                      key[2] === "search"
                    );
                  },
                });
              }
            },
          };
          return wrappedAction;
        }

        if (action.type === "resource") {
          // Wrap resource actions with query invalidation
          const wrappedAction: ResourceAction = {
            ...action,
            onExecute: async (executionContext) => {
              // Execute the original action
              await action.onExecute(executionContext);

              // After successful execution, invalidate the search query to refresh the list
              if (resourceName && context.queryClient) {
                // Use predicate to match queries that start with ["resource", resourceName, "search"]
                // This will match both 3-element and 4-element (with params) keys
                await context.queryClient.invalidateQueries({
                  predicate: (query) => {
                    const key = query.queryKey;
                    return (
                      Array.isArray(key) &&
                      key.length >= 3 &&
                      key[0] === "resource" &&
                      key[1] === resourceName &&
                      key[2] === "search"
                    );
                  },
                });
              }
            },
          };
          return wrappedAction;
        }

        // For command actions, return as-is (they would need different handling)
        return action;
      });
    },
    [resourceName, context.queryClient],
  );

  // Create a function to handle cell patching
  const handleCellPatch = useCallback(
    async (params: {
      rowId: string | number;
      fieldName: string;
      value: any;
    }): Promise<PatchResult> => {
      // Check if the view has an onPatch handler configured
      if (!view.onPatch) {
        return {
          success: false,
          errors: ["Patching is not configured for this view"],
        };
      }

      try {
        // Call the view's onPatch handler
        await view.onPatch({
          id: params.rowId,
          fieldName: params.fieldName,
          value: params.value,
          context,
        });

        // Invalidate the query to refresh the data
        if (resourceName && context.queryClient) {
          await context.queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey;
              return (
                Array.isArray(key) &&
                key.length >= 3 &&
                key[0] === "resource" &&
                key[1] === resourceName &&
                key[2] === "search"
              );
            },
          });
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          errors: [(error as Error).message || "Failed to update"],
        };
      }
    },
    [view, context, resourceName],
  );

  // Selection state for DataGrid
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<any>>(new Set());

  // Debounced fetching state - only show overlay if fetch takes longer than 150ms
  // This prevents flickering for fast fetches
  const [showFetchingOverlay, setShowFetchingOverlay] = useState(false);

  // Use React Query for data fetching with caching
  // isLoading: true only on initial load (no cached data)
  // isFetching: true whenever a fetch is in progress (initial or refetch)
  const {
    data: response,
    isLoading,
    isFetching,
    error,
  } = useResourceSearchQuery(resourceName || "unknown", view, mergedParams);

  // Debounce the fetching overlay - only show if fetch takes longer than 150ms
  // This prevents flickering for fast fetches
  useEffect(() => {
    if (isFetching) {
      const timer = setTimeout(() => {
        setShowFetchingOverlay(true);
      }, 150);
      return () => clearTimeout(timer);
    }
    setShowFetchingOverlay(false);
  }, [isFetching]);

  // Handle errors using React Query's error state - use useEffect to avoid setState in render
  useEffect(() => {
    if (error) {
      onError?.(error as Error);
    }
  }, [error, onError]);

  // Extract data from the response
  const data = response?.data || [];

  // Get the element schema from the array schema to access table layouts
  const elementSchema = (view.schemaGet as any)?._element as
    | ObjectSchema<any>
    | undefined;
  const tableLayout =
    elementSchema?.getLayout("default") || elementSchema?.getLayout("table");
  const linkFields = tableLayout?.metadata?.linkFields as string[] | undefined;

  // Get the ID field from the schema (defaults to "id")
  const idField = String(elementSchema?.getIdField() || "id");

  // Check if patching is enabled and get the patch schema
  const patchSchema = (view as any).schemaPatch as
    | ObjectSchema<any>
    | undefined;
  const isPatchEnabled =
    tableLayout?.metadata?.patchable === true &&
    view.onPatch !== undefined &&
    patchSchema !== undefined;

  // For dynamic column generation fallback (only when no tableLayout), track the first row's keys
  // This prevents columns from recalculating on every data change
  // When tableLayout exists, this returns empty string and never changes
  const dynamicColumnKeys = useMemo(() => {
    // Only compute dynamic keys when there's no table layout
    if (tableLayout) {
      return "";
    }
    if (data.length > 0) {
      return Object.keys(data[0]).join(",");
    }
    return "";
  }, [data, tableLayout]);

  // Create columns from table layout or dynamically from data
  const columns: Column<any>[] = useMemo(() => {
    const cols: Column<any>[] = [SelectColumn]; // Always include selection column first

    // Add action column if view has rowActions
    if (view.rowActions) {
      // Resolve the action layout to actual actions
      const resolvedActions = resolveActionLayout(
        view.rowActions,
        resource?.actions,
      );
      // Wrap the actions with automatic query invalidation
      const wrappedActions = wrapActionsWithInvalidation(resolvedActions);
      cols.push(createActionColumn(wrappedActions, context, idField));
    }

    if (tableLayout && tableLayout.type === "table") {
      // Use table layout to define columns
      tableLayout.fields
        .filter((field) => !field.hidden)
        .forEach((field) => {
          const fieldName = field.name as string;
          const isLinkField = linkFields?.includes(fieldName);

          // Determine if this field is patchable:
          // 1. Patching must be enabled for the view
          // 2. The field must have editable: true or editable: 'auto-commit' in the layout
          // 3. The field must exist in the patch schema (schemaPatch)
          const fieldIsEditable =
            field.editable === true || field.editable === "auto-commit";
          const fieldExistsInPatchSchema =
            patchSchema && fieldName in patchSchema._shape;
          const shouldUsePatchableColumn =
            isPatchEnabled &&
            fieldIsEditable &&
            fieldExistsInPatchSchema &&
            !isLinkField;

          if (shouldUsePatchableColumn && elementSchema) {
            // Create a patchable column with inline editing
            cols.push(
              createPatchableColumn({
                field: field as TableLayoutField<any>,
                schema: elementSchema,
                getRowId: (row: any) => row[idField],
                onPatch: handleCellPatch,
              }),
            );
          } else {
            // Create a regular read-only column
            // Use columnWidthPx if defined, otherwise get default based on field type
            let width = field.columnWidthPx;
            if (width === undefined) {
              // Get the field schema from the element schema to determine type
              const fieldSchema = elementSchema?._shape[fieldName];
              width = fieldSchema ? getDefaultColumnWidth(fieldSchema) : 150;
            }

            cols.push({
              name: field.label || fieldName,
              key: fieldName,
              width,
              resizable: true,
              frozen: field.pinned === true,
              renderCell: isLinkField
                ? ({ row }) => {
                    const value = row[fieldName];
                    const displayValue = value?.toString() || "";

                    if (row.id) {
                      return (
                        <button
                          type="button"
                          className="text-primary hover:underline text-left"
                          onClick={() => {
                            // Navigate to view screen using the resourceName
                            if (resourceName) {
                              navigate({
                                to: "/$workspace/r/$resourceName/$operation",
                                params: {
                                  workspace: workspace.slug,
                                  resourceName,
                                  operation: "view",
                                },
                                search: { id: row.id },
                              });
                            }
                          }}
                        >
                          {displayValue}
                        </button>
                      );
                    }
                    return displayValue;
                  }
                : ({ row }) => row[fieldName]?.toString() || "",
            });
          }
        });
    } else if (dynamicColumnKeys) {
      // Fallback: create columns dynamically from the first data item's keys
      dynamicColumnKeys.split(",").forEach((key) => {
        cols.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          key: key,
          width: 150,
          resizable: true,
          frozen: false, // No columns are frozen in dynamic mode
          renderCell: ({ row }) => row[key]?.toString() || "",
        });
      });
    }

    return cols;
  }, [
    tableLayout,
    linkFields,
    dynamicColumnKeys,
    resourceName,
    navigate,
    elementSchema,
    view.rowActions,
    resource?.actions,
    context,
    wrapActionsWithInvalidation,
    idField,
    workspace.slug,
    isPatchEnabled,
    patchSchema,
    handleCellPatch,
  ]);

  // Filter resource actions for the ActionBar (bulk operations)
  // This must come before early returns to avoid hook order issues
  const bulkActions = useMemo(() => {
    if (!view.tableActions) return [];

    // Resolve the action layout to actual actions
    const resolvedActions = resolveActionLayout(
      view.tableActions,
      resource?.actions,
    );

    // First wrap the actions with invalidation logic, then filter and map
    const wrappedActions = wrapActionsWithInvalidation(resolvedActions);

    return wrappedActions
      .filter((action) => action !== "separator" && action.type === "resource")
      .map((action) => ({
        ...action,
        disabled: action.disabled || selectedRows.size === 0, // Disable when no items selected
      }));
  }, [
    view.tableActions,
    resource?.actions,
    selectedRows.size,
    wrapActionsWithInvalidation,
  ]);

  return (
    <div className="h-full w-full">
      <ResourceContextProvider
        resourceType={resourceName || "unknown"}
        selectedIds={selectedRows}
      >
        <div className="flex flex-col h-full space-y-2">
          {/* Filter bar is outside DataState to prevent unmounting during loading */}
          {view.schemaFilter && filterDescriptors.length > 0 && (
            <SchemaFilterBar
              filterDescriptors={filterDescriptors}
              filterState={filterState}
              onFilterChange={setFilterValue}
              onClearFilters={clearFilters}
              showClearFilters={hasActiveFilters}
              searchValue={hasTextSearch ? searchValue : ""}
              onSearchChange={hasTextSearch ? setSearchValue : undefined}
            />
          )}
          {bulkActions.length > 0 && <ActionBar actions={bulkActions} />}
          <div className="flex-1 relative">
            {/* Initial loading state - only shown on first load (no cached data) */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                <ActivityIndicator
                  size="lg"
                  aria-label="Loading search results..."
                />
              </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-destructive z-10">
                Error loading data
              </div>
            )}

            {/* Empty state - only shown when not loading and data is empty */}
            {!isLoading && !error && data.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-10">
                No items found
              </div>
            )}

            {/* Refetch indicator - subtle overlay while fetching new data (debounced to prevent flicker) */}
            {showFetchingOverlay && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center pointer-events-none z-20">
                <ActivityIndicator size="md" aria-label="Updating results..." />
              </div>
            )}

            {/* DataGrid is always mounted to prevent flickering */}
            <DataGrid
              columns={columns}
              rows={data}
              className="h-full w-full"
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              rowKeyGetter={(row) => row[idField] || row}
            />
          </div>
        </div>
      </ResourceContextProvider>
    </div>
  );
};
