import type { FC } from "react";
import type { View } from "../../../../config/view";
import type { NubaseContextData } from "../../../../context/types";
import { NuResourceCreateViewDrawerRenderer } from "./NuResourceCreateViewDrawerRenderer";
import { NuResourceSearchViewDrawerRenderer } from "./NuResourceSearchViewDrawerRenderer";
import { NuResourceViewViewDrawerRenderer } from "./NuResourceViewViewDrawerRenderer";

export type NuDrawerViewRendererProps = {
  view: View;
  context: NubaseContextData;
  params?: Record<string, any>;
  resourceName?: string;
  onClose?: () => void;
  onRowClick?: (row: any) => void; // For search drawers
  onError?: (error: Error) => void;
};

export const NuDrawerViewRenderer: FC<NuDrawerViewRendererProps> = (props) => {
  const { view, context, params, resourceName, onClose, onRowClick, onError } =
    props;

  if (!view) {
    return null;
  }

  switch (view.type) {
    case "resource-create":
      return (
        <NuResourceCreateViewDrawerRenderer
          view={view}
          context={context}
          resourceName={resourceName}
          onClose={onClose}
          onError={onError}
        />
      );
    case "resource-view":
      return (
        <NuResourceViewViewDrawerRenderer
          view={view}
          context={context}
          params={params}
          resourceName={resourceName}
          onClose={onClose}
          onError={onError}
        />
      );
    case "resource-search":
      return (
        <NuResourceSearchViewDrawerRenderer
          view={view}
          context={context}
          params={params}
          resourceName={resourceName}
          onClose={onClose}
          onRowClick={onRowClick}
          onError={onError}
        />
      );
    default:
      return null;
  }
};
