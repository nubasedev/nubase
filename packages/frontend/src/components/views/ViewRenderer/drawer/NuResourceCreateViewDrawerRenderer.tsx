import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { ResourceCreateView } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import { DrawerFrameStructured } from "../../../floating/drawer/DrawerFrameStructured";
import { NuResourceCreateViewRenderer } from "../screen/NuResourceCreateViewRenderer";

export type NuResourceCreateViewDrawerRendererProps = {
  view: ResourceCreateView;
  context: NubaseContextData;
  resourceName?: string;
  onClose?: () => void;
  onCreate?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
};

/**
 * Thin wrapper that renders the shared NuResourceCreateViewRenderer inside a
 * DrawerFrameStructured. The renderer provides its own header (title +
 * breadcrumbs) so this wrapper only supplies chrome.
 */
export const NuResourceCreateViewDrawerRenderer: FC<
  NuResourceCreateViewDrawerRendererProps
> = ({ view, resourceName, onClose, onCreate, onError }) => {
  return (
    <DrawerFrameStructured
      onClose={onClose}
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
