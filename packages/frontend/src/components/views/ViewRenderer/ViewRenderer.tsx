import type { FC } from "react";
import type { View } from "../../../config/view";
import { ResourceCreateViewRenderer } from "./ResourceCreateViewRenderer";

export type ViewRendererProps = {
  view: View;
};

export const ViewRenderer: FC<ViewRendererProps> = (props) => {
  const { view } = props;

  switch (view.type) {
    case "resource-create":
      return <ResourceCreateViewRenderer view={view} />;
    default:
      return null;
  }
};
