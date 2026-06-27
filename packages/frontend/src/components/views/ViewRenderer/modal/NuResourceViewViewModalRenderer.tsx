import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { ResourceViewView } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import {
  ModalFrameStructured,
  type ModalFrameStructuredVariant,
} from "../../../floating/modal/ModalFrameStructured";
import { NuResourceViewViewRenderer } from "../screen/NuResourceViewViewRenderer";

export type NuResourceViewViewModalRendererProps = {
  view: ResourceViewView;
  context: NubaseContextData;
  params?: Record<string, any>;
  resourceName?: string;
  onClose?: () => void;
  onPatch?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
  frameVariant?: ModalFrameStructuredVariant;
};

/**
 * Thin wrapper that renders the shared NuResourceViewViewRenderer inside a
 * ModalFrameStructured. The renderer provides its own header (title +
 * breadcrumbs) so this wrapper only supplies chrome.
 */
export const NuResourceViewViewModalRenderer: FC<
  NuResourceViewViewModalRendererProps
> = ({
  view,
  params,
  resourceName,
  onClose,
  onPatch,
  onError,
  frameVariant,
}) => {
  return (
    <ModalFrameStructured
      onClose={onClose}
      variant={frameVariant}
      body={
        <NuResourceViewViewRenderer
          view={view}
          params={params}
          resourceName={resourceName}
          onPatch={onPatch}
          onError={onError}
        />
      }
    />
  );
};
