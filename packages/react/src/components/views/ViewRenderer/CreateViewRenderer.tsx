import type { CreateView, ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import { SchemaForm } from "../../form";

export type CreateViewRendererProps = {
  view: CreateView;
};

export const CreateViewRenderer: FC<CreateViewRendererProps> = ({ view }) => {
  return (
    <SchemaForm
      schema={view.schema}
      onSubmit={(data: ObjectOutput<any>): void | Promise<void> => {
        throw new Error("Function not implemented.");
      }}
    />
  );
};
