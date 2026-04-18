import type { FC } from "react";
import type { BreadcrumbDefinition } from "../../../config/breadcrumb";
import type { NubaseContextData } from "../../../context/types";
import { evaluateBreadcrumbs } from "../../../utils/evaluate-breadcrumbs";
import { BreadcrumbBar } from "../../navigation/breadcrumb";
import { PageHeader } from "../../page-headers/PageHeader/PageHeader";

export type ResourceViewHeaderProps = {
  title: string;
  breadcrumbs?: BreadcrumbDefinition;
  context: NubaseContextData;
  params?: Record<string, any>;
  data?: unknown;
};

/**
 * Single source of truth for a resource view's header (breadcrumbs + title).
 * Rendered at the top of every resource view body so the full-page, overlay
 * drawer, and modal variants all look identical.
 */
export const ResourceViewHeader: FC<ResourceViewHeaderProps> = ({
  title,
  breadcrumbs: breadcrumbDef,
  context,
  params,
  data,
}) => {
  const breadcrumbs = evaluateBreadcrumbs(breadcrumbDef, context, params, data);
  return (
    <div className="flex-shrink-0">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbBar items={breadcrumbs} className="mb-2" />
      )}
      <PageHeader title={title} />
    </div>
  );
};
