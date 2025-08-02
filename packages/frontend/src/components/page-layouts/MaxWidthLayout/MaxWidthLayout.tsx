import type { FC, PropsWithChildren } from "react";
import { PageHeader } from "../../page-headers/PageHeader/PageHeader";

export type MaxWidthScreenProps = {
  title: string;
};

export const MaxWidthLayout: FC<PropsWithChildren<MaxWidthScreenProps>> = (
  props,
) => {
  return (
    <div className="max-w-screen-md mx-auto my-8">
      <PageHeader title={props.title} />
      {props.children}
    </div>
  );
};
