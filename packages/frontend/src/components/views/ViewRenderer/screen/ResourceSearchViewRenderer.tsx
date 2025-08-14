import type { ObjectSchema } from "@nubase/core";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { FC } from "react";
import { useEffect, useState } from "react";
import type { ResourceSearchView } from "../../../../config/view";
import { ActivityIndicator } from "../../../activity-indicator/ActivityIndicator";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";
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
  const context = useNubaseContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
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
    };

    loadData();
  }, [params, context, onError, view.onLoad]);

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
      loading={isLoading}
      emptyMessage="No tickets found"
      enableSorting={true}
    />
  );
};
