import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { ResourceCreateView } from "../../../../config/view";
import { useSchemaForm } from "../../../../hooks";
import { useResourceInvalidation } from "../../../../hooks/useNubaseMutation";
import { SchemaForm } from "../../../form/SchemaForm/SchemaForm";
import { SchemaFormBody } from "../../../form/SchemaForm/SchemaFormBody";
import { SchemaFormButtonBar } from "../../../form/SchemaForm/SchemaFormButtonBar";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";

export type ResourceCreateViewRendererProps = {
  view: ResourceCreateView;
  resourceName?: string;
  onCreate?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
};

export const ResourceCreateViewRenderer: FC<ResourceCreateViewRendererProps> = (
  props,
) => {
  const { view, resourceName, onCreate, onError } = props;
  const context = useNubaseContext();
  const { invalidateResourceSearch } = useResourceInvalidation();

  const form = useSchemaForm({
    schema: view.schemaPost,
    onSubmit: async (data: ObjectOutput<any>) => {
      try {
        console.log("SCREEN RENDERER - Form submitted with data:", data);
        const result = await view.onSubmit({
          data,
          context,
        });

        // Invalidate resource search queries to refresh the list
        if (resourceName) {
          console.log(
            "🔄 SCREEN RENDERER - Invalidating resource search queries for:",
            resourceName,
          );
          await invalidateResourceSearch(resourceName);
        }

        onCreate?.(result);
        console.log("SCREEN RENDERER - onCreate callback completed");
      } catch (error) {
        console.log("SCREEN RENDERER - Error in form submission:", error);
        onError?.(error as Error);
      }
    },
  });

  return (
    <SchemaForm
      form={form}
      className="space-y-4"
      data-testid="resource-create-form"
    >
      <SchemaFormBody form={form} />
      <SchemaFormButtonBar form={form} />
    </SchemaForm>
  );
};
