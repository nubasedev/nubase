import type { ActionOrSeparator } from "../../../actions/types";
import { useActionExecutor } from "../../../actions/useActionExecutor";
import { groupActionsBySeparators } from "../../../actions/utils";
import { cn } from "../../../styling/cn";
import { Button } from "../Button/Button";
import { ButtonGroup } from "../ButtonGroup/ButtonGroup";

export type ActionBarProps = {
  actions: ActionOrSeparator[];
  className?: string;
};

/**
 * Renders a list of actions as grouped outline buttons. Separators in the
 * action list split the buttons into distinct `<ButtonGroup>` clusters —
 * each cluster shares collapsed borders (like the drawer's command bar).
 *
 * Destructive actions render with red text; disabled actions are dimmed.
 * Used by `ResourceSearchViewRenderer` (table toolbar) and `TopBar`
 * (global actions). Designed to be reusable in any context that needs an
 * action strip.
 */
export const ActionBar = ({ actions, className }: ActionBarProps) => {
  const { executeAction } = useActionExecutor();
  const actionGroups = groupActionsBySeparators(actions);

  if (actionGroups.length === 0) return null;

  return (
    <div
      data-component="ActionBar"
      className={cn("flex items-center gap-2", className)}
      role="toolbar"
    >
      {actionGroups.map((group, groupIndex) => (
        <ButtonGroup key={groupIndex}>
          {group.map((action) => {
            const {
              icon: IconComponent,
              label,
              disabled,
              id,
              variant,
            } = action;

            if (!IconComponent && !label) return null;

            return (
              <Button
                key={id}
                variant="outline"
                size="sm"
                onClick={() => executeAction(action)}
                disabled={disabled}
                aria-label={label || `Action ${id}`}
                className={
                  variant === "destructive"
                    ? "text-destructive hover:bg-destructive/10"
                    : undefined
                }
              >
                {IconComponent && <IconComponent />}
                {label && <span>{label}</span>}
              </Button>
            );
          })}
        </ButtonGroup>
      ))}
    </div>
  );
};
