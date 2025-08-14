import type { FC, PropsWithChildren } from "react";
import { PageHeader } from "../page-headers/PageHeader/PageHeader";

export type CenteredLayoutProps = {
  title: string;
};

export const CenteredLayout: FC<PropsWithChildren<CenteredLayoutProps>> = (
  props,
) => {
  return (
    <div
      data-component="CenteredLayout"
      className="max-w-screen-md mx-auto my-8"
    >
      <PageHeader title={props.title} />
      {props.children}
    </div>
  );
};
