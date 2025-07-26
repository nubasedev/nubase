import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { CreateView } from "../../../config/view";
import { SchemaForm } from "../../form";
import { useNubaseContext } from "../../nubase-app/NubaseContextProvider";

export type CreateViewRendererProps = {
  view: CreateView;
};

export const CreateViewRenderer: FC<CreateViewRendererProps> = ({ view }) => {
  const context = useNubaseContext();
  return (
    <SchemaForm
      schema={view.schema}
      onSubmit={(data: ObjectOutput<any>) => {
        view.onSubmit({
          data,
          http: context.httpClient,
        });
      }}
    />
  );
};
