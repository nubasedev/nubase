import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import type React from "react";

export type BreadcrumbProps = React.ComponentProps<"nav">;

function Breadcrumb({ ...props }: BreadcrumbProps) {
  return <nav data-component="Breadcrumb" aria-label="breadcrumb" {...props} />;
}

export type BreadcrumbListProps = React.ComponentProps<"ol">;

function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ol
      data-component="BreadcrumbList"
      className={`text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5 ${className || ""}`}
      {...props}
    />
  );
}

export type BreadcrumbItemProps = React.ComponentProps<"li">;

function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return (
    <li
      className={`inline-flex items-center gap-1.5 ${className || ""}`}
      {...props}
    />
  );
}

export type BreadcrumbLinkProps = React.ComponentProps<"a">;

function BreadcrumbLink({ className, ...props }: BreadcrumbLinkProps) {
  return (
    <a
      className={`hover:text-foreground transition-colors ${className || ""}`}
      {...props}
    />
  );
}

export type BreadcrumbPageProps = React.ComponentProps<"span">;

function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return (
    <span
      aria-current="page"
      className={`text-foreground font-normal ${className || ""}`}
      {...props}
    />
  );
}

export type BreadcrumbSeparatorProps = React.ComponentProps<"li"> & {
  children?: React.ReactNode;
};

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={`[&>svg]:size-3.5 ${className || ""}`}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  );
}

export type BreadcrumbEllipsisProps = React.ComponentProps<"span">;

function BreadcrumbEllipsis({ className, ...props }: BreadcrumbEllipsisProps) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={`flex size-9 items-center justify-center ${className || ""}`}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
