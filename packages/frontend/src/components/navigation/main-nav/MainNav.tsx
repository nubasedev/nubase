import { forwardRef } from "react";
import { cn } from "../../../styling/cn";
import { SearchableTreeNavigator } from "../searchable-tree-navigator/SearchableTreeNavigator";
import type { TreeNavigatorItem } from "../searchable-tree-navigator/TreeNavigatorItem";

export interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  items: TreeNavigatorItem[];
  searchPlaceholder?: string;
}

export const MainNav = forwardRef<HTMLElement, MainNavProps>(
  (
    { className, items, searchPlaceholder = "Search navigation...", ...props },
    ref,
  ) => {
    return (
      <nav
        ref={ref}
        className={cn("flex flex-col h-full bg-sidebar w-full p-2", className)}
        aria-label="Main navigation"
        {...props}
      >
        <SearchableTreeNavigator
          items={items}
          placeHolder={searchPlaceholder}
          height="full"
        />
      </nav>
    );
  },
);

MainNav.displayName = "MainNav";
