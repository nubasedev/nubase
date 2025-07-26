import type { FC, PropsWithChildren } from "react";

export type PageHeaderProps = {
  title: string;
};

export const PageHeader: FC<PropsWithChildren<PageHeaderProps>> = (props) => {
  return (
    <div
      data-component="PageHeader"
      className="mb-2 border-b border-border pb-1"
    >
      <h1 className="text-lg font-bold">{props.title}</h1>
    </div>
  );
};
