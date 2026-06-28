import type { ObjectOutput } from "@nubase/core";
import type { FC } from "react";
import type { ResourceViewView } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import { DrawerFrameStructured } from "../../../floating/drawer/DrawerFrameStructured";
import { NuResourceViewViewRenderer } from "../screen/NuResourceViewViewRenderer";

export type NuResourceViewViewDrawerRendererProps = {
  view: ResourceViewView;
  context: NubaseContextData;
  params?: Record<string, any>;
  resourceName?: string;
  onClose?: () => void;
  onPatch?: (data: ObjectOutput<any>) => void;
  onError?: (error: Error) => void;
};

/**
 * Thin wrapper that renders the shared NuResourceViewViewRenderer inside a
 * DrawerFrameStructured. The renderer provides its own header (title +
 * breadcrumbs) so this wrapper only supplies chrome.
 */
export const NuResourceViewViewDrawerRenderer: FC<
  NuResourceViewViewDrawerRendererProps
> = ({ view, params, resourceName, onClose, onPatch, onError }) => {
  return (
    <DrawerFrameStructured
      onClose={onClose}
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
