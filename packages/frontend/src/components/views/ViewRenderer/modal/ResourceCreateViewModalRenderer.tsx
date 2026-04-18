import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { ResourceCreateView } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import { useSchemaForm } from "../../../../hooks";
import { useResourceInvalidation } from "../../../../hooks/useNubaseMutation";
import { ModalFrameSchemaForm } from "../../../floating/modal/ModalFrameSchemaForm";
import type { ModalFrameStructuredVariant } from "../../../floating/modal/ModalFrameStructured";

export type ResourceCreateViewModalRendererProps = {
  view: ResourceCreateView;
  context: NubaseContextData;
  resourceName?: string;
  onClose?: () => void;
  onCreate?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
  frameVariant?: ModalFrameStructuredVariant;
};

export const ResourceCreateViewModalRenderer: FC<
  ResourceCreateViewModalRendererProps
> = (props) => {
  const {
    view,
    context,
    resourceName,
    onClose,
    onCreate,
    onError,
    frameVariant,
  } = props;
  const { invalidateResourceSearch } = useResourceInvalidation();

  const form = useSchemaForm({
    schema: view.schemaPost,
    onSubmit: async (data: ObjectOutput<any>) => {
      try {
        const result = await view.onSubmit({
          data,
          context,
        });

        // Invalidate resource search queries to refresh the list
        if (resourceName) {
          await invalidateResourceSearch(resourceName);
        }

        onCreate?.(result);
        onClose?.(); // Close modal on successful creation
      } catch (error) {
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
      variant={frameVariant}
    />
  );
};
