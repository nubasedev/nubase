import type React from "react";
import { forwardRef, useMemo } from "react";
import type { Action } from "../../config/global-action";
import type { NubaseContextData } from "../../context/types";
import { cn } from "../../utils";
import { ActionBar } from "../buttons/ActionBar";
import type { ActionBarGroup } from "../buttons/ActionBar/ActionBar";
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
    // Convert global actions from config to ActionBar format
    const actionBarGroups = useMemo((): ActionBarGroup[] => {
      const globalActions = context.config.globalActions || [];

      if (globalActions.length === 0) {
        return [];
      }

      // Split actions by separators into groups
      const groups: ActionBarGroup[] = [];
      let currentGroupActions: any[] = [];
      let groupIndex = 0;

      for (const item of globalActions) {
        if (item === "separator") {
          // Create group if we have actions
          if (currentGroupActions.length > 0) {
            groups.push({
              id: `group-${groupIndex}`,
              actions: currentGroupActions.map((action: Action) => ({
                id: action.id,
                icon: action.icon,
                label: action.label,
                disabled: action.disabled,
                onClick: () => {
                  context.commands.execute(action.command, action.commandArgs);
                },
              })),
            });
            currentGroupActions = [];
            groupIndex++;
          }
        } else {
          currentGroupActions.push(item);
        }
      }

      // Add remaining actions as the last group
      if (currentGroupActions.length > 0) {
        groups.push({
          id: `group-${groupIndex}`,
          actions: currentGroupActions.map((action: Action) => ({
            id: action.id,
            icon: action.icon,
            label: action.label,
            disabled: action.disabled,
            onClick: () => {
              context.commands.execute(action.command, action.commandArgs);
            },
          })),
        });
      }

      return groups;
    }, [context.config.globalActions, context.commands]);

    const hasGlobalActions = actionBarGroups.length > 0;

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
              context.router.navigate({ to: "/" });
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
            <ActionBar groups={actionBarGroups} />
          </div>
        )}
      </div>
    );
  },
);

TopBar.displayName = "TopBar";

export { TopBar };
