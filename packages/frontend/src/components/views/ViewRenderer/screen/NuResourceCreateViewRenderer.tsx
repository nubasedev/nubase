import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { ResourceCreateView } from "../../../../config/view";
import { useSchemaForm } from "../../../../hooks";
import { SchemaForm } from "../../../form/SchemaForm/SchemaForm";
import { SchemaFormBody } from "../../../form/SchemaForm/SchemaFormBody";
import { SchemaFormButtonBar } from "../../../form/SchemaForm/SchemaFormButtonBar";
import { SchemaFormValidationErrors } from "../../../form/SchemaForm/SchemaFormValidationErrors";
import { useNubaseContext } from "../../../nubase-app/NubaseContextProvider";
import { NuResourceViewHeader } from "../../common/NuResourceViewHeader";

export type NuResourceCreateViewRendererProps = {
  view: ResourceCreateView;
  resourceName?: string;
  onCreate?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
};

export const NuResourceCreateViewRenderer: FC<
  NuResourceCreateViewRendererProps
> = (props) => {
  const { view, resourceName, onCreate, onError } = props;
  const context = useNubaseContext();

  const form = useSchemaForm({
    schema: view.schema,
    onSubmit: async (data: ObjectOutput<any>) => {
      try {
        const result = await view.onSubmit({
          data,
          context,
        });

        // Emit a create event; the central event bridge invalidates the
        // resource's queries so the search list refreshes.
        if (resourceName) {
          context.events.emit("resource.created", {
            resourceName,
            source: "form",
          });
        }

        onCreate?.(result);
      } catch (error) {
        onError?.(error as Error);
      }
    },
  });

  return (
    <div className="flex flex-col h-full gap-4">
      <NuResourceViewHeader
        title={view.title}
        breadcrumbs={view.breadcrumbs}
        context={context}
      />
      <SchemaForm
        form={form}
        className="space-y-4"
        data-testid="resource-create-form"
      >
        <SchemaFormBody form={form} />
        <SchemaFormValidationErrors form={form} />
        <SchemaFormButtonBar form={form} />
      </SchemaForm>
    </div>
  );
};
