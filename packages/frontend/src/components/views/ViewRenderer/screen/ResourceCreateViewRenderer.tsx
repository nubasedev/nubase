import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { ResourceCreateView } from "../../../../config/view";
import { useSchemaForm } from "../../../../hooks";
import { SchemaForm } from "../../../form/SchemaForm/SchemaForm";
import { SchemaFormBody } from "../../../form/SchemaForm/SchemaFormBody";
import { SchemaFormButtonBar } from "../../../form/SchemaForm/SchemaFormButtonBar";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";

export type ResourceCreateViewRendererProps = {
  view: ResourceCreateView;
  onCreate?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
};

export const ResourceCreateViewRenderer: FC<ResourceCreateViewRendererProps> = (
  props,
) => {
  const { view, onCreate, onError } = props;
  const context = useNubaseContext();

  const form = useSchemaForm({
    schema: view.schema,
    onSubmit: async (data: ObjectOutput<any>) => {
      try {
        console.log("RENDERER - Form submitted with data:", data);
        const result = await view.onSubmit({
          data,
          context,
        });
        onCreate?.(result);
        console.log("RENDERER - onCreate callback completed");
      } catch (error) {
        console.log("RENDERER - Error in form submission:", error);
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
