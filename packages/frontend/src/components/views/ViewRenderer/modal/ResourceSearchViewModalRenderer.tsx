import type { ObjectSchema } from "@nubase/core";
import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";
import type { ResourceSearchView } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import { ActivityIndicator } from "../../../activity-indicator/ActivityIndicator";
import { DataGrid } from "../../../data-grid/DataGrid";
import type { Column } from "../../../data-grid/types";
import { ModalFrameStructured } from "../../../floating/modal/ModalFrameStructured";

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
  const { view, context, params, onClose, onRowClick, onError } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  // Load data function that can be called from effects
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get the element schema from the array schema to access table layouts
  const elementSchema = (view.schemaGet as any)?._element as
    | ObjectSchema<any>
    | undefined;
  const tableLayout =
    elementSchema?.getLayout("default") || elementSchema?.getLayout("table");
  const linkFields = tableLayout?.metadata?.linkFields as string[] | undefined;

  // Create columns from table layout or dynamically from data
  const columns: Column<any>[] = (() => {
    if (tableLayout && tableLayout.type === "table" && tableLayout.groups[0]) {
      // Use table layout to define columns
      return tableLayout.groups[0].fields
        .filter((field) => !field.hidden)
        .map((field) => {
          const fieldName = field.name as string;
          const isLinkField = linkFields?.includes(fieldName);

          return {
            key: fieldName,
            name: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
            width: (field as any).columnWidthPx || 150,
            resizable: true,
            renderCell: ({ row }) => {
              const value = row[fieldName];
              const displayValue = value?.toString() || "";

              if (isLinkField && row.id) {
                // Make this field a clickable link, but in modal context
                // Instead of navigating, trigger the onRowClick callback
                return (
                  <button
                    type="button"
                    className="text-primary hover:underline text-left"
                    onClick={() => {
                      onRowClick?.(row);
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
        key: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        width: 150,
        resizable: true,
        renderCell: ({ row }) => {
          const value = row[key];
          return value?.toString() || "";
        },
      }));
    }
    return [];
  })();

  // No actions column for modal view - actions should be handled at the resource level

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
        <DataGrid
          columns={columns}
          rows={data}
          className="h-full w-full"
          rowKeyGetter={(row) => row.id || row}
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
