import type { FC, PropsWithChildren } from "react";
import type { BreadcrumbItem } from "../../config/breadcrumb";
import { BreadcrumbBar } from "../navigation/breadcrumb";
import { PageHeader } from "../page-headers/PageHeader/PageHeader";

export type FullScreenLayoutProps = {
  title: string;
  /**
   * Optional breadcrumb trail to display above the page header
   */
  breadcrumbs?: BreadcrumbItem[];
};

export const FullScreenLayout: FC<PropsWithChildren<FullScreenLayoutProps>> = (
  props,
) => {
  return (
    <div data-component="FullScreenLayout" className="my-4 mx-4">
      {props.breadcrumbs && props.breadcrumbs.length > 0 && (
        <BreadcrumbBar items={props.breadcrumbs} className="mb-4" />
      )}
      <PageHeader title={props.title} />
      {props.children}
    </div>
  );
};
