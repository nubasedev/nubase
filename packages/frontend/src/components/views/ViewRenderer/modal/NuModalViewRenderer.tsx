import type { FC } from "react";
import type { View } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import type { ModalFrameStructuredVariant } from "../../../floating/modal/ModalFrameStructured";
import { NuResourceCreateViewModalRenderer } from "./NuResourceCreateViewModalRenderer";
import { NuResourceSearchViewModalRenderer } from "./NuResourceSearchViewModalRenderer";
import { NuResourceViewViewModalRenderer } from "./NuResourceViewViewModalRenderer";

export type NuModalViewRendererProps = {
  view: View;
  context: NubaseContextData;
  params?: Record<string, any>;
  resourceName?: string;
  onClose?: () => void;
  onRowClick?: (row: any) => void; // For search modals
  onError?: (error: Error) => void;
  frameVariant?: ModalFrameStructuredVariant;
};

export const NuModalViewRenderer: FC<NuModalViewRendererProps> = (props) => {
  const {
    view,
    context,
    params,
    resourceName,
    onClose,
    onRowClick,
    onError,
    frameVariant,
  } = props;

  if (!view) {
    return null;
  }

  switch (view.type) {
    case "resource-create":
      return (
        <NuResourceCreateViewModalRenderer
          view={view}
          context={context}
          resourceName={resourceName}
          onClose={onClose}
          onError={onError}
          frameVariant={frameVariant}
        />
      );
    case "resource-view":
      return (
        <NuResourceViewViewModalRenderer
          view={view}
          context={context}
          params={params}
          resourceName={resourceName}
          onClose={onClose}
          onError={onError}
          frameVariant={frameVariant}
        />
      );
    case "resource-search":
      return (
        <NuResourceSearchViewModalRenderer
          view={view}
          context={context}
          params={params}
          resourceName={resourceName}
          onClose={onClose}
          onRowClick={onRowClick}
          onError={onError}
          frameVariant={frameVariant}
        />
      );
    default:
      return null;
  }
};
