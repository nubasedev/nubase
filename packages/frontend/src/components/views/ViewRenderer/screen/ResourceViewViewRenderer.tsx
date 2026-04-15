import type { ObjectOutput } from "@nubase/core";
import { useNavigate } from "@tanstack/react-router";
import { type FC, useEffect, useMemo, useState } from "react";
import type {
  RelatedCollection,
  ResourceViewView,
} from "../../../../config/view";
import { useWorkspace } from "../../../../context/WorkspaceContext";
import { useSchemaForm } from "../../../../hooks";
import { useResourceInvalidation } from "../../../../hooks/useNubaseMutation";
import { DataState } from "../../../data-state";
import { SchemaForm } from "../../../form/SchemaForm/SchemaForm";
import { SchemaFormBody } from "../../../form/SchemaForm/SchemaFormBody";
import { SchemaFormValidationErrors } from "../../../form/SchemaForm/SchemaFormValidationErrors";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";
import { SearchableTable } from "../../../searchable-table";

export type ResourceViewViewRendererProps = {
  view: ResourceViewView;
  params?: Record<string, any>;
  resourceName?: string;
  onPatch?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
};

export const ResourceViewViewRenderer: FC<ResourceViewViewRendererProps> = (
  props,
) => {
  const {
    view,
    params,
    resourceName,
    onPatch: onPatchCallback,
    onError,
  } = props;
  const context = useNubaseContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialData, setInitialData] = useState<Record<string, any> | null>(
    null,
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const contextWithParams = {
          ...context,
          params: params || undefined,
        };
        const response = await view.onLoad({
          context: contextWithParams as any,
        });
        setInitialData(response.data);
      } catch (err) {
        const loadError = err as Error;
        setError(loadError);
        onError?.(loadError);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params, context, onError, view.onLoad]); // Re-load if params change

  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={!initialData}
      emptyMessage="Failed to load resource data"
      loadingLabel="Loading resource data..."
    >
      {initialData && (
        <ResourceViewForm
          view={view}
          initialData={initialData}
          params={params}
          resourceName={resourceName}
          onPatch={onPatchCallback}
          onError={onError}
          context={context}
        />
      )}
    </DataState>
  );
};

// Separate component to properly handle form initialization with loaded data
const ResourceViewForm: FC<{
  view: ResourceViewView;
  initialData: Record<string, any>;
  params?: Record<string, any>;
  resourceName?: string;
  onPatch?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
  context: any;
}> = ({
  view,
  initialData,
  params,
  resourceName,
  onPatch: onPatchCallback,
  onError,
  context,
}) => {
  const { invalidateResourceSearch } = useResourceInvalidation();

  const form = useSchemaForm({
    schema: view.schemaGet,
    mode: "patch",
    initialValues: initialData,
    onPatch: async (fieldName: string, value) => {
      // Validation now happens in SchemaFormBody
      // This layer only handles network operations
      try {
        const patchData = { [fieldName]: value };
        const contextWithParams = {
          ...context,
          params: params || undefined,
        };
        const result = await view.onPatch({
          data: patchData,
          context: contextWithParams as any,
        });

        // Invalidate search queries so the list view reflects the update
        if (resourceName) {
          await invalidateResourceSearch(resourceName);
        }

        onPatchCallback?.(result);
      } catch (error) {
        // Only call onError for actual network/server errors, not validation errors
        onError?.(error as Error);
        throw error; // Re-throw to let the form handle it
      }
    },
    onSubmit: async () => {
      // Not used in patch mode
    },
  });

  const relatedEntries = useMemo(
    () => Object.entries(view.relatedCollections ?? {}),
    [view.relatedCollections],
  );

  return (
    <div className="h-full overflow-y-auto">
      <SchemaForm
        form={form}
        className="space-y-4"
        data-testid="resource-view-form"
      >
        <SchemaFormBody form={form} />
        <SchemaFormValidationErrors form={form} />
      </SchemaForm>

      {relatedEntries.map(([key, collection]) => (
        <RelatedCollectionSection
          key={key}
          collectionKey={key}
          collection={collection}
          parent={initialData}
          context={context}
          params={params}
        />
      ))}
    </div>
  );
};

const RelatedCollectionSection: FC<{
  collectionKey: string;
  collection: RelatedCollection;
  parent: Record<string, any>;
  context: any;
  params?: Record<string, any>;
}> = ({ collectionKey, collection, parent, context, params }) => {
  const navigate = useNavigate();
  const workspace = useWorkspace();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const idField = String(collection.schema.getIdField() || "id");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const contextWithParams = {
          ...context,
          params: params || undefined,
        };
        const response = await collection.onSearch({
          parent,
          query,
          context: contextWithParams,
        });
        if (!cancelled) {
          setRows(response.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          // Surface as empty rather than crashing the whole view
          console.error(
            `Failed to load related collection "${collectionKey}":`,
            err,
          );
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [collection, parent, query, context, params, collectionKey]);

  return (
    <div className="mt-8 space-y-2">
      <h2 className="text-lg font-semibold">{collection.label}</h2>
      <div className="h-[400px]">
        <SearchableTable
          schema={collection.schema}
          rows={rows}
          searchValue={query}
          onSearchChange={setQuery}
          loading={loading}
          searchPlaceholder={collection.searchPlaceholder ?? "Search..."}
          onRowClick={(row) => {
            const rowId = row[idField];
            if (rowId === undefined || rowId === null) return;
            navigate({
              to: "/$workspace/r/$resourceName/$operation",
              params: {
                workspace: workspace.slug,
                resourceName: collection.targetResourceId,
                operation: "view",
              },
              search: { [idField]: rowId },
            });
          }}
        />
      </div>
    </div>
  );
};
