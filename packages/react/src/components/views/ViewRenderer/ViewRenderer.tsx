import type { View } from "@nubase/core";
import type { FC } from "react";
import { CreateViewRenderer } from "./CreateViewRenderer";

export type ViewRendererProps = {
  view: View;
};

export const ViewRenderer: FC<ViewRendererProps> = (props) => {
  const { view } = props;

  switch (view.type) {
    case "create":
      return <CreateViewRenderer view={view} />;
    default:
      return null;
  }
};
