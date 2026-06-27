import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { ResourceCreateView } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import {
  ModalFrameStructured,
  type ModalFrameStructuredVariant,
} from "../../../floating/modal/ModalFrameStructured";
import { NuResourceCreateViewRenderer } from "../screen/NuResourceCreateViewRenderer";

export type NuResourceCreateViewModalRendererProps = {
  view: ResourceCreateView;
  context: NubaseContextData;
  resourceName?: string;
  onClose?: () => void;
  onCreate?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
  frameVariant?: ModalFrameStructuredVariant;
};

/**
 * Thin wrapper that renders the shared NuResourceCreateViewRenderer inside a
 * ModalFrameStructured. The renderer provides its own header (title +
 * breadcrumbs) so this wrapper only supplies chrome.
 */
export const NuResourceCreateViewModalRenderer: FC<
  NuResourceCreateViewModalRendererProps
> = ({ view, resourceName, onClose, onCreate, onError, frameVariant }) => {
  return (
    <ModalFrameStructured
      onClose={onClose}
      variant={frameVariant}
      body={
        <NuResourceCreateViewRenderer
          view={view}
          resourceName={resourceName}
          onCreate={(data) => {
            onCreate?.(data);
            onClose?.();
          }}
          onError={onError}
        />
      }
    />
  );
};
