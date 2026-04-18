import type { FC } from "react";
import type { View } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import type { ModalFrameStructuredVariant } from "../../../floating/modal/ModalFrameStructured";
import { ResourceCreateViewModalRenderer } from "./ResourceCreateViewModalRenderer";
import { ResourceSearchViewModalRenderer } from "./ResourceSearchViewModalRenderer";
import { ResourceViewViewModalRenderer } from "./ResourceViewViewModalRenderer";

export type ModalViewRendererProps = {
  view: View;
  context: NubaseContextData;
  params?: Record<string, any>;
  resourceName?: string;
  onClose?: () => void;
  onRowClick?: (row: any) => void; // For search modals
  onError?: (error: Error) => void;
  frameVariant?: ModalFrameStructuredVariant;
};

export const ModalViewRenderer: FC<ModalViewRendererProps> = (props) => {
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
        <ResourceCreateViewModalRenderer
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
        <ResourceViewViewModalRenderer
          view={view}
          context={context}
          params={params}
          onClose={onClose}
          onError={onError}
          frameVariant={frameVariant}
        />
      );
    case "resource-search":
      return (
        <ResourceSearchViewModalRenderer
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
