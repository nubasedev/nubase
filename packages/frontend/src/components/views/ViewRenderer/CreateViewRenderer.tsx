import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { CreateView } from "../../../config/view";
import { useSchemaForm } from "../../../hooks";
import { SchemaForm } from "../../form";
import { SchemaFormButtonBar } from "../../form/SchemaForm/SchemaFormButtonBar";
import { useNubaseContext } from "../../nubase-app/NubaseContextProvider";

export type CreateViewRendererProps = {
  view: CreateView;
};

export const CreateViewRenderer: FC<CreateViewRendererProps> = ({ view }) => {
  const context = useNubaseContext();

  const form = useSchemaForm({
    schema: view.schema,
    onSubmit: (data: ObjectOutput<any>) => {
      view.onSubmit({
        data,
        context,
      });
    },
  });

  return (
    <div className="space-y-4">
      <SchemaForm form={form} />
      <SchemaFormButtonBar form={form} />
    </div>
  );
};
