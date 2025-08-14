import type { FC } from "react";
import type { View } from "../../../config/view";
import {
  ResourceCreateViewRenderer,
  ResourceSearchViewRenderer,
  ResourceViewViewRenderer,
} from "./screen";

export type ViewRendererProps = {
  view: View;
  params?: Record<string, any>;
  onError?: (error: Error) => void;
};

export const ViewRenderer: FC<ViewRendererProps> = (props) => {
  const { view, params, onError } = props;

  if (!view) {
    return null;
  }

  switch (view.type) {
    case "resource-create":
      return <ResourceCreateViewRenderer view={view} />;
    case "resource-view":
      return (
        <ResourceViewViewRenderer
          view={view}
          params={params}
          onError={onError}
        />
      );
    case "resource-search":
      return (
        <ResourceSearchViewRenderer
          view={view}
          params={params}
          onError={onError}
        />
      );
    default:
      return null;
  }
};
