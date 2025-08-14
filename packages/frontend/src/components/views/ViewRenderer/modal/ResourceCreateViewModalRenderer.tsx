import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { ResourceCreateView } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import { useSchemaForm } from "../../../../hooks";
import { ModalFrameSchemaForm } from "../../../floating/modal/ModalFrameSchemaForm";

export type ResourceCreateViewModalRendererProps = {
  view: ResourceCreateView;
  context: NubaseContextData;
  onClose?: () => void;
  onCreate?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
};

export const ResourceCreateViewModalRenderer: FC<
  ResourceCreateViewModalRendererProps
> = (props) => {
  const { view, context, onClose, onCreate, onError } = props;

  const form = useSchemaForm({
    schema: view.schema,
    onSubmit: async (data: ObjectOutput<any>) => {
      try {
        console.log("MODAL RENDERER - Form submitted with data:", data);
        const result = await view.onSubmit({
          data,
          context,
        });
        onCreate?.(result);
        onClose?.(); // Close modal on successful creation
        console.log("MODAL RENDERER - onCreate callback completed");
      } catch (error) {
        console.log("MODAL RENDERER - Error in form submission:", error);
        onError?.(error as Error);
      }
    },
  });

  return (
    <ModalFrameSchemaForm
      title={view.title}
      form={form}
      onClose={onClose}
      submitText="Create"
    />
  );
};
