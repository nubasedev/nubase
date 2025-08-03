import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { CreateView } from "../../../config/view";
import { useSchemaForm } from "../../../hooks";
import { SchemaForm } from "../../form/SchemaForm/SchemaForm";
import { SchemaFormBody } from "../../form/SchemaForm/SchemaFormBody";
import { SchemaFormButtonBar } from "../../form/SchemaForm/SchemaFormButtonBar";
import { useNubaseContext } from "../../nubase-app/NubaseContextProvider";

export type CreateViewRendererProps = {
  view: CreateView;
  onCreate?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
};

export const CreateViewRenderer: FC<CreateViewRendererProps> = (props) => {
  const { view, onCreate, onError } = props;
  const context = useNubaseContext();

  const form = useSchemaForm({
    schema: view.schema,
    onSubmit: async (data: ObjectOutput<any>) => {
      try {
        const result = await view.createResource({
          data,
          context,
        });
        onCreate?.(result);
      } catch (error) {
        onError?.(error as Error);
      }
    },
  });

  return (
    <SchemaForm form={form} className="space-y-4">
      <SchemaFormBody form={form} />
      <SchemaFormButtonBar form={form} />
    </SchemaForm>
  );
};
