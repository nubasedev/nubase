import type { ObjectOutput } from "@nubase/core";
import { type FC, useEffect, useMemo, useState } from "react";
import { resolveActionLayout } from "../../../../actions/utils";
import type { ResourceDescriptor } from "../../../../config/resource";
import type { ResourceViewView } from "../../../../config/view";
import { ResourceContextProvider } from "../../../../context/ResourceContext";
import { useSchemaForm } from "../../../../hooks";
import { useResourceInvalidation } from "../../../../hooks/useNubaseMutation";
import { useResourceViewQuery } from "../../../../hooks/useNubaseQuery";
import { ActionBar } from "../../../buttons/ActionBar/ActionBar";
import { DataState } from "../../../data-state";
import { ParentRecordProvider } from "../../../form/parent-record-context";
import { SchemaForm } from "../../../form/SchemaForm/SchemaForm";
import { SchemaFormBody } from "../../../form/SchemaForm/SchemaFormBody";
import { SchemaFormValidationErrors } from "../../../form/SchemaForm/SchemaFormValidationErrors";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";
import { SearchFilterBar } from "../../../search-controls/SearchFilterBar";
import { ResourceViewHeader } from "../../common/ResourceViewHeader";

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
  const resource = resourceName
    ? context.config.resources[resourceName]
    : undefined;

  // TanStack Query is the single source of truth for the record. Mutations
  // elsewhere (e.g. form patches, inline cell edits) call invalidateResource,
  // which marks this query stale and refetches in the background. Because the
  // query is configured with placeholderData: keepPreviousData, the UI keeps
  // rendering the previous record — no spinner flash — and anything derived
  // from the data (breadcrumbs, headers) updates automatically when the
  // refetched record arrives.
  const {
    data: response,
    isLoading,
    error,
  } = useResourceViewQuery(resourceName || "unknown", view, params);

  const initialData =
    (response?.data as Record<string, any> | undefined) ?? null;

  useEffect(() => {
    if (error) onError?.(error as Error);
  }, [error, onError]);

  return (
    <div className="flex flex-col h-full gap-4">
      <ResourceViewHeader
        title={view.title}
        breadcrumbs={view.breadcrumbs}
        context={context}
        params={params}
        data={initialData}
      />
      <div className="flex-1 min-h-0">
        <DataState
          // Only show the loading state when there is truly nothing to display.
          // keepPreviousData keeps initialData populated during background refetches.
          isLoading={isLoading && !initialData}
          error={error as Error | null}
          isEmpty={!initialData}
          emptyMessage="Failed to load resource data"
          loadingLabel="Loading resource data..."
        >
          {initialData && (
            // Key on params so switching to a different record re-mounts the
            // form (its state is sticky by design). Within the same record,
            // the form persists across refetches — user input isn't clobbered.
            <ResourceViewForm
              key={JSON.stringify(params ?? {})}
              view={view}
              initialData={initialData}
              params={params}
              resourceName={resourceName}
              resource={resource}
              onPatch={onPatchCallback}
              onError={onError}
              context={context}
            />
          )}
        </DataState>
      </div>
    </div>
  );
};

const ResourceViewForm: FC<{
  view: ResourceViewView;
  initialData: Record<string, any>;
  params?: Record<string, any>;
  resourceName?: string;
  resource?: ResourceDescriptor;
  onPatch?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
  context: any;
}> = ({
  view,
  initialData,
  params,
  resourceName,
  resource,
  onPatch: onPatchCallback,
  onError,
  context,
}) => {
  const { invalidateResource } = useResourceInvalidation();

  const form = useSchemaForm({
    schema: view.schema,
    mode: "patch",
    initialValues: initialData,
    onPatch: async (fieldName: string, value) => {
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

        // One mechanism for all consumers: invalidate the resource's queries.
        // The view query refetches in the background, which updates
        // `initialData` upstream and re-evaluates the breadcrumb/header.
        if (resourceName) {
          await invalidateResource(resourceName);
        }

        onPatchCallback?.(result);
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    onSubmit: async () => {
      // Not used in patch mode
    },
  });

  const [searchTerm, setSearchTerm] = useState("");

  const resolvedActions = useMemo(
    () => resolveActionLayout(view.actions, resource?.actions),
    [view.actions, resource?.actions],
  );

  const recordId = initialData?.id ?? params?.id;
  const selectedIds = useMemo(
    () =>
      new Set<string | number>(
        recordId !== undefined ? [recordId] : [],
      ) as ReadonlySet<string | number>,
    [recordId],
  );

  return (
    <ResourceContextProvider
      resourceType={resourceName || "unknown"}
      selectedIds={selectedIds}
    >
      <div className="h-full flex flex-col gap-2">
        <SearchFilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search fields..."
          searchExpand
          showClearFilters={false}
        />
        {resolvedActions.length > 0 && <ActionBar actions={resolvedActions} />}
        <div className="flex-1 overflow-y-auto min-h-0">
          <ParentRecordProvider parent={initialData}>
            <SchemaForm
              form={form}
              className="space-y-4"
              data-testid="resource-view-form"
            >
              <SchemaFormBody form={form} searchTerm={searchTerm} />
              <SchemaFormValidationErrors form={form} />
            </SchemaForm>
          </ParentRecordProvider>
        </div>
      </div>
    </ResourceContextProvider>
  );
};
