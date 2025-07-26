import type { FC, PropsWithChildren } from "react";
import type { BreadcrumbItem } from "../../config/breadcrumb";
import { BreadcrumbBar } from "../navigation/breadcrumb";
import { PageHeader } from "../page-headers/PageHeader/PageHeader";

export type FullScreenFixedHeaderLayoutProps = {
  title: string;
  /**
   * Optional breadcrumb trail to display above the page header
   */
  breadcrumbs?: BreadcrumbItem[];
};

export const FullScreenFixedHeaderLayout: FC<
  PropsWithChildren<FullScreenFixedHeaderLayoutProps>
> = (props) => {
  return (
    <div data-component="FullScreenLayout" className="flex flex-col h-full p-4">
      {props.breadcrumbs && props.breadcrumbs.length > 0 && (
        <BreadcrumbBar
          items={props.breadcrumbs}
          className="mb-2 flex-shrink-0"
        />
      )}
      <div className="flex-shrink-0">
        <PageHeader title={props.title} />
      </div>
      <div className="flex-1 min-h-0">{props.children}</div>
    </div>
  );
};
