import type { BaseSchema, ObjectSchema, TableLayoutField } from "@nubase/core";
import { OptionalSchema } from "@nubase/core";
import { useNavigate } from "@tanstack/react-router";
import type { FC } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ActionOrSeparator,
  HandlerAction,
  ResourceAction,
} from "../../../../actions/types";
import type { ActionLayout } from "../../../../config/action-layout";
import type { ResourceDescriptor } from "../../../../config/resource";
import type { ResourceSearchView } from "../../../../config/view";
import { ResourceContextProvider } from "../../../../context/ResourceContext";
import { useTenant } from "../../../../context/TenantContext";
import { useResourceSearchQuery } from "../../../../hooks/useNubaseQuery";
import { ActionBar } from "../../../buttons/ActionBar/ActionBar";
import { createActionColumn, SelectColumn } from "../../../data-grid/Columns";
import { DataGrid } from "../../../data-grid/DataGrid";
import type { Column } from "../../../data-grid/types";
import { DataState } from "../../../data-state";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";

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
  const tenant = useTenant();

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

  // Selection state for DataGrid
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<any>>(new Set());

  // Use React Query for data fetching with caching
  const {
    data: response,
    isLoading,
    error,
  } = useResourceSearchQuery(resourceName || "unknown", view, params);

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

    if (tableLayout && tableLayout.type === "table" && tableLayout.groups[0]) {
      // Use table layout to define columns
      (tableLayout.groups[0].fields as TableLayoutField<any>[])
        .filter((field) => !field.hidden)
        .forEach((field) => {
          const fieldName = field.name as string;
          const isLinkField = linkFields?.includes(fieldName);

          // Use columnWidthPx if defined, otherwise get default based on field type
          let width = field.columnWidthPx;
          if (width === undefined) {
            // Get the field schema from the element schema to determine type
            const fieldSchema = elementSchema?._shape[fieldName];
            width = fieldSchema ? getDefaultColumnWidth(fieldSchema) : 150;
          }

          cols.push({
            name: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
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
                              to: "/$tenant/r/$resourceName/$operation",
                              params: {
                                tenant: tenant.slug,
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
        });
    } else if (data.length > 0) {
      // Fallback: create columns dynamically from the first data item
      Object.keys(data[0]).forEach((key) => {
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
    data,
    resourceName,
    navigate,
    elementSchema,
    view.rowActions,
    resource?.actions,
    context,
    wrapActionsWithInvalidation,
    idField,
    tenant.slug,
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
    <DataState
      isLoading={isLoading}
      error={error as Error | null}
      isEmpty={data.length === 0}
      loadingLabel="Loading search results..."
    >
      <div className="h-full w-full">
        <ResourceContextProvider
          resourceType={resourceName || "unknown"}
          selectedIds={selectedRows}
        >
          <div className="flex flex-col h-full space-y-2">
            {bulkActions.length > 0 && <ActionBar actions={bulkActions} />}
            <div className="flex-1">
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
    </DataState>
  );
};
