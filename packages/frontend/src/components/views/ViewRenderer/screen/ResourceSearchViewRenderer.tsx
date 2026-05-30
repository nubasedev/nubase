import type { BaseSchema, ObjectSchema, TableLayoutField } from "@nubase/core";
import { OptionalSchema } from "@nubase/core";
import type { FC } from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  normalizeActionSeparators,
  resolveActionLayout,
} from "../../../../actions/utils";
import type { ResourceDescriptor } from "../../../../config/resource";
import type { ResourceSearchView } from "../../../../config/view";
import { ResourceContextProvider } from "../../../../context/ResourceContext";
import { emitEvent } from "../../../../events";
import { useLastDefined } from "../../../../hooks/useLastDefined";
import { useResourceSearchQuery } from "../../../../hooks/useNubaseQuery";
import { useOverlays } from "../../../../hooks/useOverlays";
import { useSchemaFilters } from "../../../../hooks/useSchemaFilters";
import { isServerNetworkError } from "../../../../utils/network-errors";
import { ActivityIndicator } from "../../../activity-indicator";
import { ActionBar } from "../../../buttons/ActionBar/ActionBar";
import {
  createActionColumn,
  createNavigateColumn,
  SelectColumn,
} from "../../../data-grid/Columns";
import { DataGrid } from "../../../data-grid/DataGrid";
import {
  createPatchableColumn,
  type PatchResult,
} from "../../../data-grid/patching";
import type { Column } from "../../../data-grid/types";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";
import { SchemaFilterBar as SchemaFilterBarBase } from "../../../schema-filter-bar";
import { ResourceViewHeader } from "../../common/ResourceViewHeader";

/**
 * Pulls an NQL error message out of a `ServerNetworkError` whose body was
 * produced by the backend's NQL compiler. Returns `undefined` when the
 * error isn't a 400 with a shaped NQL payload.
 */
function extractNqlErrorMessage(error: unknown): string | undefined {
  if (!isServerNetworkError(error)) return undefined;
  if (error.statusCode !== 400) return undefined;
  const data = error.responseData as
    | { error?: string; code?: string; line?: number; column?: number }
    | undefined;
  if (!data || typeof data.error !== "string") return undefined;
  // Only surface messages that the NQL compiler emits.
  if (
    data.code !== "TOKENIZE" &&
    data.code !== "PARSE" &&
    data.code !== "VALIDATE"
  ) {
    return undefined;
  }
  if (typeof data.line === "number" && typeof data.column === "number") {
    return `${data.error} (line ${data.line}, col ${data.column})`;
  }
  return data.error;
}

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

export type ResourceSearchViewRendererProps = {
  view: ResourceSearchView;
  params?: Record<string, any>;
  resourceName?: string;
  resource?: ResourceDescriptor;
  onError?: (error: Error) => void;
  /**
   * When true the renderer drops the page-level chrome — no
   * `ResourceViewHeader` (title + breadcrumbs) and the filter bar uses
   * its `simplified` mode. Used when this view is embedded inside
   * another view's form (e.g. a 1×N relation field).
   */
  embedded?: boolean;
};

export const ResourceSearchViewRenderer: FC<ResourceSearchViewRendererProps> = (
  props,
) => {
  const { view, params, resourceName, resource, onError, embedded } = props;
  const context = useNubaseContext();
  const { openOverlay } = useOverlays();

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
    nqlMode,
    setNqlMode,
    nqlValue,
    setNqlValue,
  } = useSchemaFilters(view.schemaFilter);

  // Merge URL params with filter state for the query
  const mergedParams = useMemo(() => {
    const filterParams = getRequestParams();
    return { ...params, ...filterParams };
  }, [params, getRequestParams]);

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

        // Emit event for successful cell patch (silent by default per notification rules).
        // The central event bridge handles query invalidation.
        if (resourceName) {
          emitEvent("resource.patched", {
            resourceName,
            fieldName: params.fieldName,
            value: params.value,
            source: "datagrid",
          });
        }

        return { success: true };
      } catch (error) {
        // Emit event for failed cell patch
        if (resourceName) {
          emitEvent("resource.saveFailed", {
            resourceName,
            error: error as Error,
            source: "datagrid",
          });
        }
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

  // Sticky-hold the NQL error message during in-flight fetches. While
  // `isFetching` is true, TanStack drops `error` back to `undefined`
  // until the next response settles — without this hold, the floating
  // error under the editor unmounts and remounts on every keystroke
  // and visibly flickers.
  const liveNqlError = nqlMode ? extractNqlErrorMessage(error) : undefined;
  const [displayedNqlError, setDisplayedNqlError] = useState<
    string | undefined
  >(undefined);
  useEffect(() => {
    if (!nqlMode) {
      setDisplayedNqlError(undefined);
      return;
    }
    if (isFetching) return;
    setDisplayedNqlError(liveNqlError);
  }, [nqlMode, isFetching, liveNqlError]);

  // Debounce the fetching overlay - only show if fetch takes longer than 150ms.
  // This prevents flickering for fast fetches. Failing queries don't arm the
  // timer at all — we never want the spinner to paint over stale data while
  // the user is staring at an error message.
  useEffect(() => {
    if (error) {
      setShowFetchingOverlay(false);
      return;
    }
    if (isFetching) {
      const timer = setTimeout(() => {
        setShowFetchingOverlay(true);
      }, 150);
      return () => clearTimeout(timer);
    }
    setShowFetchingOverlay(false);
  }, [isFetching, error]);

  // Handle errors using React Query's error state - use useEffect to avoid
  // setState in render. NQL errors are surfaced inline under the filter-bar
  // editor, so we skip the global toast for them — otherwise every keystroke
  // while the user is mid-typing produces another "Error loading resource"
  // toast.
  useEffect(() => {
    if (!error) return;
    if (extractNqlErrorMessage(error)) return;
    onError?.(error as Error);
  }, [error, onError]);

  // Keep the last successful rows visible through a failing refetch
  // (e.g. an invalid NQL query). TanStack's `placeholderData:
  // keepPreviousData` only bridges the `isFetching` window — once the
  // new query errors the placeholder is dropped — so we sticky-hold it
  // ourselves.
  const data = useLastDefined(response?.data) ?? [];

  // Get the element schema from the array schema to access table layouts
  const elementSchema = (view.schema as any)?._element as
    | ObjectSchema<any>
    | undefined;
  const tableLayout = elementSchema?.getTableLayout();

  // Get the ID field from the schema (defaults to "id")
  const idField = String(elementSchema?.getIdField() || "id");

  // Determine if the resource is navigable (has a "view" operation)
  const isNavigable = Boolean(resource?.views?.view);

  // Check if patching is enabled and get the patch schema
  const patchSchema = (view as any).schemaPatch as
    | ObjectSchema<any>
    | undefined;
  const isPatchEnabled =
    tableLayout?.metadata?.patchable === true &&
    view.onPatch !== undefined &&
    patchSchema !== undefined;

  // Resolve view.actions once — every downstream slot (toolbar + per-row
  // dropdown) derives from this single list. Selection-scoped actions in
  // the toolbar are disabled when nothing is selected; global actions are
  // dropped from the per-row dropdown. Orphan separators from filtering
  // are normalized away before each consumer renders.
  const resolvedActions = useMemo(
    () => resolveActionLayout(view.actions, resource?.actions),
    [view.actions, resource?.actions],
  );

  const bulkActions = useMemo(
    () =>
      normalizeActionSeparators(
        resolvedActions.map((action) => {
          if (action === "separator") return action;
          if (action.type !== "resource") return action;
          const requiresSelection = action.scope !== "global";
          return {
            ...action,
            disabled:
              action.disabled || (requiresSelection && selectedRows.size === 0),
          };
        }),
      ),
    [resolvedActions, selectedRows.size],
  );

  const rowActions = useMemo(
    () =>
      normalizeActionSeparators(
        resolvedActions.filter(
          (action) =>
            action === "separator" ||
            action.type !== "resource" ||
            action.scope !== "global",
        ),
      ),
    [resolvedActions],
  );

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

    // Add per-row action column when the derived row-action list is non-empty.
    if (rowActions.length > 0) {
      cols.push(createActionColumn(rowActions, context, idField));
    }

    // Add navigate column if the resource has a "view" operation
    if (isNavigable && resourceName) {
      cols.push(
        createNavigateColumn((row: any) => {
          openOverlay({
            resource: resourceName,
            operation: "view",
            params: { [idField]: String(row[idField]) },
          });
        }, idField),
      );
    }

    if (tableLayout) {
      // Use table layout to define columns
      tableLayout.fields
        .filter((field) => !field.hidden)
        .forEach((field) => {
          const fieldName = field.name as string;

          // Determine if this field is patchable:
          // 1. Patching must be enabled for the view
          // 2. The field must have editable: true or editable: 'auto-commit' in the layout
          // 3. The field must exist in the patch schema (schemaPatch)
          const fieldIsEditable =
            field.editable === true || field.editable === "auto-commit";
          const fieldExistsInPatchSchema =
            patchSchema && fieldName in patchSchema._shape;
          const shouldUsePatchableColumn =
            isPatchEnabled && fieldIsEditable && fieldExistsInPatchSchema;

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
              renderCell: ({ row }) => row[fieldName]?.toString() || "",
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
    dynamicColumnKeys,
    resourceName,
    openOverlay,
    elementSchema,
    rowActions,
    context,
    idField,
    isPatchEnabled,
    patchSchema,
    handleCellPatch,
    isNavigable,
  ]);

  return (
    <div className={`flex flex-col h-full w-full ${embedded ? "" : "gap-4"}`}>
      {!embedded && (
        <ResourceViewHeader
          title={view.title}
          breadcrumbs={view.breadcrumbs}
          context={context}
          params={params}
          data={data}
        />
      )}
      <ResourceContextProvider
        resourceType={resourceName || "unknown"}
        selectedIds={selectedRows}
      >
        <div className="flex flex-col flex-1 min-h-0 space-y-2">
          {/* Filter bar is outside DataState to prevent unmounting during loading */}
          {view.schemaFilter && (
            <SchemaFilterBar
              mode={embedded ? "simplified" : "full"}
              schema={view.schemaFilter}
              filterDescriptors={filterDescriptors}
              filterState={filterState}
              onFilterChange={setFilterValue}
              onClearFilters={clearFilters}
              showClearFilters={hasActiveFilters}
              searchValue={hasTextSearch ? searchValue : ""}
              onSearchChange={hasTextSearch ? setSearchValue : undefined}
              nqlMode={nqlMode}
              onNqlModeChange={setNqlMode}
              nqlValue={nqlValue}
              onNqlValueChange={setNqlValue}
              nqlErrorMessage={displayedNqlError}
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

            {/* Error state — skipped entirely for NQL errors (the inline
                message under the editor is the canonical signal) and, for
                other errors, only covers the grid when we have no rows to
                fall back on thanks to `keepPreviousData`. */}
            {error &&
              !isLoading &&
              data.length === 0 &&
              !extractNqlErrorMessage(error) && (
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
            {showFetchingOverlay && !error && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center pointer-events-none z-20">
                <ActivityIndicator size="md" aria-label="Updating results..." />
              </div>
            )}

            {/* DataGrid is always mounted to prevent flickering */}
            <DataGrid
              columns={columns}
              rows={data}
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
