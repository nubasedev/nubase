import { forwardRef } from "react";
import { cn } from "../../../styling/cn";
import { SearchableTreeNavigator } from "../searchable-tree-navigator/SearchableTreeNavigator";
import type { TreeNavigatorItem } from "../searchable-tree-navigator/TreeNavigatorItem";

export interface MainNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TreeNavigatorItem[];
  searchPlaceholder?: string;
}

export const MainNav = forwardRef<HTMLDivElement, MainNavProps>(
  (
    { className, items, searchPlaceholder = "Search navigation...", ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col h-full bg-sidebar w-full p-2", className)}
        {...props}
      >
        <SearchableTreeNavigator
          items={items}
          placeHolder={searchPlaceholder}
          height="full"
        />
      </div>
    );
  },
);

MainNav.displayName = "MainNav";
