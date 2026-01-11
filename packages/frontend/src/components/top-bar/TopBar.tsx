import type React from "react";
import { forwardRef } from "react";
import type { NubaseContextData } from "../../context/types";
import { getWorkspaceFromRouter } from "../../context/WorkspaceContext";
import { cn } from "../../styling/cn";
import { ActionBar } from "../buttons/ActionBar";
import { UserMenu } from "../user-avatar";
import { SearchBar } from "./SearchBar";

export interface TopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  context: NubaseContextData;
}

/**
 * TopBar component that provides global search and actions.
 * Contains a SearchBar for command search and ActionBar for global actions.
 */
const TopBar = forwardRef<HTMLDivElement, TopBarProps>(
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
          "flex items-center gap-4 px-4 py-2 bg-background border-b border-border",
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
        <SearchBar context={context} />

        {/* Global Actions */}
        {hasGlobalActions && (
          <div className="flex items-center">
            <ActionBar actions={globalActions} />
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

TopBar.displayName = "TopBar";

export { TopBar };
