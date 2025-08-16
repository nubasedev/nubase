import type { ObjectSchema } from "@nubase/core";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, TrashIcon } from "lucide-react";
import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";
import type { ResourceSearchView } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import { useResourceDeleteMutation } from "../../../../hooks/useNubaseMutation";
import { ActivityIndicator } from "../../../activity-indicator/ActivityIndicator";
import { Button } from "../../../buttons/Button/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../dropdown-menu/DropdownMenu";
import { useDialog } from "../../../floating/dialog";
import { ModalFrameStructured } from "../../../floating/modal/ModalFrameStructured";
import { showToast } from "../../../floating/toast";
import { EnhancedTable } from "../../../table/Table";

export type ResourceSearchViewModalRendererProps = {
  view: ResourceSearchView;
  context: NubaseContextData;
  params?: Record<string, any>;
  resourceName?: string;
  onClose?: () => void;
  onRowClick?: (row: any) => void; // Callback for when a row is clicked
  onError?: (error: Error) => void;
};

export const ResourceSearchViewModalRenderer: FC<
  ResourceSearchViewModalRendererProps
> = (props) => {
  const { view, context, params, resourceName, onClose, onRowClick, onError } =
    props;
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const { openDialog } = useDialog();

  // Load data function that can be called from effects or mutation handlers
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const contextWithParams = {
        ...context,
        params: params || undefined,
      };
      const response = await view.onLoad({
        context: contextWithParams as any,
      });
      setData(response.data);
    } catch (error) {
      onError?.(error as Error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [context, params, onError, view.onLoad]);

  // Set up delete mutation - always call hook but disable if onDelete is not available
  const deleteMutation = useResourceDeleteMutation(
    resourceName || "unknown",
    view as any,
    {
      onSuccess: () => {
        showToast("Item deleted successfully", "default");
        // Refresh the data after successful deletion
        loadData();
      },
      onError: (error) => {
        showToast("Failed to delete item", "error");
        onError?.(error as Error);
      },
    },
  );

  // Only use the mutation if onDelete is available
  const canDelete = view.onDelete != null;

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

  useEffect(() => {
    loadData();
  }, [loadData]);

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
                // Make this field a clickable link, but in modal context
                // Instead of navigating, trigger the onRowClick callback
                return (
                  <button
                    type="button"
                    className="text-primary hover:underline text-left"
                    onClick={() => {
                      onRowClick?.(row.original);
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

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <ActivityIndicator size="lg" aria-label="Loading search results..." />
        </div>
      );
    }

    return (
      <div className="h-full">
        <EnhancedTable
          data={data}
          columns={columns}
          actionsColumn={actionsColumn}
          loading={isLoading}
          emptyMessage="No results found"
          enableSorting={true}
        />
      </div>
    );
  };

  return (
    <ModalFrameStructured
      onClose={onClose}
      header={
        <h2 className="text-lg font-semibold text-foreground">{view.title}</h2>
      }
      body={renderBody()}
    />
  );
};
