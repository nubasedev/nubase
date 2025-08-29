import type { ObjectOutput } from "@nubase/core";
import { type FC, useEffect, useState } from "react";
import type { ResourceViewView } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import { useSchemaForm } from "../../../../hooks";
import { ActivityIndicator } from "../../../activity-indicator/ActivityIndicator";
import { ModalFrameStructured } from "../../../floating/modal/ModalFrameStructured";
import { SchemaForm } from "../../../form/SchemaForm/SchemaForm";
import { SchemaFormBody } from "../../../form/SchemaForm/SchemaFormBody";

export type ResourceViewViewModalRendererProps = {
  view: ResourceViewView;
  context: NubaseContextData;
  params?: Record<string, any>;
  onClose?: () => void;
  onPatch?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
};

export const ResourceViewViewModalRenderer: FC<
  ResourceViewViewModalRendererProps
> = (props) => {
  const {
    view,
    context,
    params,
    onClose,
    onPatch: onPatchCallback,
    onError,
  } = props;
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
  }, [params, context, onError, view.onLoad]);

  const renderBody = () => {
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
        onError?.(error as Error);
        throw error;
      }
    },
    onSubmit: async () => {
      // Not used in patch mode
    },
  });

  return (
    <SchemaForm
      form={form}
      className="space-y-4"
      data-testid="resource-view-form-modal"
    >
      <SchemaFormBody form={form} />
    </SchemaForm>
  );
};
