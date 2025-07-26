import type { ObjectOutput } from "@nubase/core";
import { type FC, useEffect, useState } from "react";
import type { ResourceViewView } from "../../../../config/view";
import { useSchemaForm } from "../../../../hooks";
import { ActivityIndicator } from "../../../activity-indicator/ActivityIndicator";
import { SchemaForm } from "../../../form/SchemaForm/SchemaForm";
import { SchemaFormBody } from "../../../form/SchemaForm/SchemaFormBody";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";

export type ResourceViewViewRendererProps = {
  view: ResourceViewView;
  params?: Record<string, any>;
  onPatch?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
};

export const ResourceViewViewRenderer: FC<ResourceViewViewRendererProps> = (
  props,
) => {
  const { view, params, onPatch: onPatchCallback, onError } = props;
  const context = useNubaseContext();
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, any> | null>(
    null,
  );

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
        setInitialData(response.data);
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params, context, onError, view.onLoad]); // Re-load if params change

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <ActivityIndicator size="lg" aria-label="Loading resource data..." />
      </div>
    );
  }

  if (!initialData) {
    return <div>Failed to load resource data</div>;
  }

  return (
    <ResourceViewForm
      view={view}
      initialData={initialData}
      params={params}
      onPatch={onPatchCallback}
      onError={onError}
      context={context}
    />
  );
};

// Separate component to properly handle form initialization with loaded data
const ResourceViewForm: FC<{
  view: ResourceViewView;
  initialData: Record<string, any>;
  params?: Record<string, any>;
  onPatch?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
  context: any;
}> = ({
  view,
  initialData,
  params,
  onPatch: onPatchCallback,
  onError,
  context,
}) => {
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

  return (
    <div className="h-full overflow-y-auto">
      <SchemaForm
        form={form}
        className="space-y-4"
        data-testid="resource-view-form"
      >
        <SchemaFormBody form={form} />
      </SchemaForm>
    </div>
  );
};
