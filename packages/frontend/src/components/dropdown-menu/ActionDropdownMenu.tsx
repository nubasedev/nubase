import type React from "react";
import { forwardRef } from "react";
import type { ActionOrSeparator } from "../../actions/types";
import { useActionExecutor } from "../../actions/useActionExecutor";
import { groupActionsBySeparators } from "../../actions/utils";
import { cn } from "../../styling/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";

export interface ActionDropdownMenuProps {
  trigger: React.ReactNode;
  actions: ActionOrSeparator[];
  className?: string;
  contentClassName?: string;
  /**
   * Side offset for the dropdown menu content.
   * @default 4
   */
  sideOffset?: number;
  /**
   * Whether the menu should close when an action is executed.
   * @default true
   */
  closeOnAction?: boolean;
}

/**
 * A dropdown menu component that takes standardized actions and renders them as menu items.
 * Supports both command and handler actions, with automatic action execution.
 * Actions can be grouped using "separator" entries.
 */
const ActionDropdownMenu = forwardRef<
  React.ElementRef<typeof DropdownMenu>,
  ActionDropdownMenuProps
>(
  (
    {
      trigger,
      actions,
      className,
      contentClassName,
      sideOffset = 4,
      closeOnAction = true,
      ...props
    },
    _ref,
  ) => {
    const { executeAction } = useActionExecutor();

    // Group actions by separators
    const actionGroups = groupActionsBySeparators(actions);

    const handleActionClick = async (action: ActionOrSeparator) => {
      if (action === "separator") return;
      await executeAction(action);
    };

    return (
      <DropdownMenu {...props}>
        <DropdownMenuTrigger asChild className={className}>
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn(contentClassName)}
          sideOffset={sideOffset}
        >
          {actionGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {groupIndex > 0 && <DropdownMenuSeparator />}
              {group.map((action) => {
                const {
                  icon: IconComponent,
                  label,
                  disabled,
                  id,
                  variant,
                } = action;

                return (
                  <DropdownMenuItem
                    key={id}
                    disabled={disabled}
                    variant={
                      variant === "destructive" ? "destructive" : "default"
                    }
                    onClick={() => handleActionClick(action)}
                  >
                    {IconComponent && <IconComponent size={16} />}
                    {label || id}
                  </DropdownMenuItem>
                );
              })}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

ActionDropdownMenu.displayName = "ActionDropdownMenu";

export { ActionDropdownMenu };
