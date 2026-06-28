import type { FC } from "react";
import type { ResourceSearchView } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import { DrawerFrameStructured } from "../../../floating/drawer/DrawerFrameStructured";
import { NuResourceSearchViewRenderer } from "../screen/NuResourceSearchViewRenderer";

export type NuResourceSearchViewDrawerRendererProps = {
  view: ResourceSearchView;
  context: NubaseContextData;
  params?: Record<string, any>;
  resourceName?: string;
  onClose?: () => void;
  onRowClick?: (row: any) => void;
  onError?: (error: Error) => void;
};

/**
 * Thin wrapper that renders the shared NuResourceSearchViewRenderer inside a
 * DrawerFrameStructured. The renderer provides its own header (title +
 * breadcrumbs) so this wrapper only supplies chrome.
 */
export const NuResourceSearchViewDrawerRenderer: FC<
  NuResourceSearchViewDrawerRendererProps
> = ({ view, params, resourceName, onClose, onError }) => {
  return (
    <DrawerFrameStructured
      onClose={onClose}
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
