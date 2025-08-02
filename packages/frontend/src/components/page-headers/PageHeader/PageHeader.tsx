import type { FC, PropsWithChildren } from "react";

export type PageHeaderProps = {
  title: string;
};

export const PageHeader: FC<PropsWithChildren<PageHeaderProps>> = (props) => {
  return (
    <div className="mb-4 border-b border-outlineVariant pb-2">
      <h1 className="text-2xl font-bold">{props.title}</h1>
    </div>
  );
};
