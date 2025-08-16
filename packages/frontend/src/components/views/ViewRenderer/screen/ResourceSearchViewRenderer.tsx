import type { ObjectSchema } from "@nubase/core";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, TrashIcon } from "lucide-react";
import type { FC } from "react";
import { useEffect } from "react";
import type { ResourceSearchView } from "../../../../config/view";
import {
  useResourceDeleteMutation,
  useResourceInvalidation,
} from "../../../../hooks/useNubaseMutation";
import { useResourceSearchQuery } from "../../../../hooks/useNubaseQuery";
import { ActivityIndicator } from "../../../activity-indicator/ActivityIndicator";
import { Button } from "../../../buttons/Button/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../dropdown-menu/DropdownMenu";
import { useDialog } from "../../../floating/dialog";
import { showToast } from "../../../floating/toast";
import { EnhancedTable } from "../../../table/Table";

export type ResourceSearchViewRendererProps = {
  view: ResourceSearchView;
  params?: Record<string, any>;
  resourceName?: string;
  onError?: (error: Error) => void;
};

export const ResourceSearchViewRenderer: FC<ResourceSearchViewRendererProps> = (
  props,
) => {
  const { view, params, resourceName, onError } = props;
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const { invalidateResourceSearch } = useResourceInvalidation();

  // Use React Query for data fetching with caching
  const {
    data: response,
    isLoading,
    error,
  } = useResourceSearchQuery(resourceName || "unknown", view, params);

  // Set up delete mutation - always call hook but disable if onDelete is not available
  const deleteMutation = useResourceDeleteMutation(
    resourceName || "unknown",
    view as any,
    {
      onSuccess: async () => {
        showToast("Item deleted successfully", "default");
        // Manually invalidate the search queries to force refetch
        if (resourceName) {
          await invalidateResourceSearch(resourceName);
        }
      },
      onError: (error) => {
        showToast("Failed to delete item", "error");
        onError?.(error as Error);
      },
    },
  );

  // Only use the mutation if onDelete is available
  const canDelete = view.onDelete != null;

  // Handle errors using React Query's error state - use useEffect to avoid setState in render
  useEffect(() => {
    if (error) {
      onError?.(error as Error);
    }
  }, [error, onError]);

  // Extract data from the response
  const data = response?.data || [];

  // Delete handler function
  const handleDelete = (item: any) => {
    if (!canDelete) return;

    openDialog({
      title: "Delete Item",
      content:
        "Are you sure you want to delete this item? This action cannot be undone.",
      confirmText: "Delete",
      confirmVariant: "destructive",
      onConfirm: () => {
        deleteMutation.mutate(item);
      },
    });
  };

  // Get the element schema from the array schema to access table layouts
  const elementSchema = (view.schema as any)?._element as
    | ObjectSchema<any>
    | undefined;
  const tableLayout =
    elementSchema?.getLayout("default") || elementSchema?.getLayout("table");
  const linkFields = tableLayout?.metadata?.linkFields as string[] | undefined;

  // Create columns from table layout or dynamically from data
  const columns: ColumnDef<any>[] = (() => {
    if (tableLayout && tableLayout.type === "table" && tableLayout.groups[0]) {
      // Use table layout to define columns
      return tableLayout.groups[0].fields
        .filter((field) => !field.hidden)
        .map((field) => {
          const fieldName = field.name as string;
          const isLinkField = linkFields?.includes(fieldName);

          return {
            accessorKey: fieldName,
            header: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
            size: field.size,
            cell: ({ getValue, row }) => {
              const value = getValue();
              const displayValue = value?.toString() || "";

              if (isLinkField && row.original.id) {
                // Make this field a clickable link to view the resource
                // Assume the URL pattern is /r/{resourceId}/view?id={id}
                // You'll need to get the resourceId from somewhere - maybe from view metadata
                return (
                  <button
                    type="button"
                    className="text-primary hover:underline text-left"
                    onClick={() => {
                      // Navigate to view screen using the resourceName
                      if (resourceName) {
                        navigate({
                          to: "/r/$resourceName/$operation",
                          params: { resourceName, operation: "view" },
                          search: { id: row.original.id },
                        });
                      }
                    }}
                  >
                    {displayValue}
                  </button>
                );
              }

              return displayValue;
            },
          };
        });
    } else if (data.length > 0) {
      // Fallback: create columns dynamically from the first data item
      return Object.keys(data[0]).map((key) => ({
        accessorKey: key,
        header: key.charAt(0).toUpperCase() + key.slice(1),
        cell: ({ getValue }) => {
          const value = getValue();
          return value?.toString() || "";
        },
      }));
    }
    return [];
  })();

  // Create actions column if delete functionality is available
  const actionsColumn: ColumnDef<any> | undefined = canDelete
    ? {
        id: "actions",
        header: "Actions",
        size: 80,
        cell: ({ row }) => {
          const item = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDelete(item)}
                  disabled={deleteMutation?.isPending}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }
    : undefined;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <ActivityIndicator size="lg" aria-label="Loading search results..." />
      </div>
    );
  }

  return (
    <EnhancedTable
      data={data}
      columns={columns}
      actionsColumn={actionsColumn}
      loading={isLoading}
      emptyMessage="No tickets found"
      enableSorting={true}
    />
  );
};
