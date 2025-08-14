import { useNavigate } from "@tanstack/react-router";
import { type FC, Fragment } from "react";
import type { BreadcrumbItem } from "../../../config/breadcrumb";
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemComponent,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./Breadcrumb";

interface BreadcrumbBarProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbBar: FC<BreadcrumbBarProps> = ({ items, className }) => {
  const navigate = useNavigate();

  if (items.length === 0) {
    return null;
  }

  const handleNavigation = (item: BreadcrumbItem) => {
    if (typeof item === "string") return;

    if (item.to) {
      navigate({
        to: item.to,
        params: item.params,
        search: item.search,
      });
    }
  };

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const label = typeof item === "string" ? item : item.label;
          const isClickable = typeof item !== "string" && item.to;

          return (
            <Fragment key={index}>
              <BreadcrumbItemComponent>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : isClickable ? (
                  <button
                    type="button"
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleNavigation(item)}
                  >
                    {label}
                  </button>
                ) : (
                  <span className="text-muted-foreground">{label}</span>
                )}
              </BreadcrumbItemComponent>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
