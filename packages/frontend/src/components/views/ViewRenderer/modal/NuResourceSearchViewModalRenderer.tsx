import type { FC } from "react";
import type { ResourceSearchView } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import {
  ModalFrameStructured,
  type ModalFrameStructuredVariant,
} from "../../../floating/modal/ModalFrameStructured";
import { NuResourceSearchViewRenderer } from "../screen/NuResourceSearchViewRenderer";

export type NuResourceSearchViewModalRendererProps = {
  view: ResourceSearchView;
  context: NubaseContextData;
  params?: Record<string, any>;
  resourceName?: string;
  onClose?: () => void;
  onRowClick?: (row: any) => void;
  onError?: (error: Error) => void;
  frameVariant?: ModalFrameStructuredVariant;
};

/**
 * Thin wrapper that renders the shared NuResourceSearchViewRenderer inside a
 * ModalFrameStructured. The renderer provides its own header (title +
 * breadcrumbs) so this wrapper only supplies chrome.
 */
export const NuResourceSearchViewModalRenderer: FC<
  NuResourceSearchViewModalRendererProps
> = ({ view, params, resourceName, onClose, onError, frameVariant }) => {
  return (
    <ModalFrameStructured
      onClose={onClose}
      variant={frameVariant}
      body={
        <NuResourceSearchViewRenderer
          view={view}
          params={params}
          resourceName={resourceName}
          onError={onError}
        />
      }
    />
  );
};
