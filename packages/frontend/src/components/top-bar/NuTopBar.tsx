import type React from "react";
import { forwardRef } from "react";
import type { NubaseContextData } from "../../context/types";
import { getWorkspaceFromRouter } from "../../context/WorkspaceContext";
import { cn } from "../../styling/cn";
import { NuActionBar } from "../buttons/ActionBar";
import { UserMenu } from "../user-avatar";
import { NuSearchBar } from "./NuSearchBar";

export interface NuTopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  context: NubaseContextData;
}

/**
 * NuTopBar component that provides global search and actions.
 * Contains a NuSearchBar for command search and NuActionBar for global actions.
 */
const NuTopBar = forwardRef<HTMLDivElement, NuTopBarProps>(
  ({ className, context, ...props }, ref) => {
    const globalActions = context.config.globalActions || [];
    const hasGlobalActions = globalActions.length > 0;
    const { authentication } = context;
    const authState = authentication?.getState();
    const user = authState?.user;

    const handleSignOut = async () => {
      await authentication?.logout();
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-12 items-center gap-4 px-4 bg-background border-b border-border",
          className,
        )}
        {...props}
      >
        {/* App Name */}
        <div className="flex items-center">
          <button
            type="button"
            className="text-lg font-semibold text-foreground truncate hover:text-foreground/80 transition-colors cursor-pointer"
            onClick={() => {
              const workspace = getWorkspaceFromRouter(context.router);
              const homePath = workspace ? `/${workspace}` : "/";
              context.router.navigate({ to: homePath });
            }}
            aria-label="Navigate to home"
          >
            {context.config.appName}
          </button>
        </div>

        {/* Search Bar */}
        <NuSearchBar context={context} />

        {/* Global Actions */}
        {hasGlobalActions && (
          <div className="flex items-center">
            <NuActionBar actions={globalActions} />
          </div>
        )}

        {/* Spacer to push user avatar to the right */}
        <div className="flex-1" />

        {/* User Menu */}
        {user && (
          <UserMenu
            name={user.displayName}
            email={user.email}
            onSignOut={handleSignOut}
          />
        )}
      </div>
    );
  },
);

NuTopBar.displayName = "NuTopBar";

export { NuTopBar };
