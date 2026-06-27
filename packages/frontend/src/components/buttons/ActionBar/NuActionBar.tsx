import type { ActionOrSeparator } from "../../../actions/types";
import { useActionExecutor } from "../../../actions/useActionExecutor";
import { groupActionsBySeparators } from "../../../actions/utils";
import { Button } from "../Button/Button";
import { ButtonGroup } from "../ButtonGroup/ButtonGroup";
import { ActionBar } from "./ActionBar";

export type NuActionBarProps = {
  actions: ActionOrSeparator[];
  variant?: "default" | "ghost";
  className?: string;
};

/**
 * Nubase-bound action toolbar. Takes a list of Nubase `Action`s (separators
 * split them into groups), executes them via `useActionExecutor` (requires the
 * NubaseContext), and renders through the presentational `ActionBar` primitive.
 *
 * `default` renders outline buttons with joined borders; `ghost` renders
 * borderless buttons with a divider between groups. Destructive actions render
 * with red text; disabled actions are dimmed.
 *
 * Used by `NuTopBar` (global actions) and the resource view renderers.
 */
export const NuActionBar = ({
  actions,
  variant = "default",
  className,
}: NuActionBarProps) => {
  const { executeAction } = useActionExecutor();
  const actionGroups = groupActionsBySeparators(actions);

  if (actionGroups.length === 0) return null;

  const buttonVariant = variant === "ghost" ? "ghost" : "outline";

  return (
    <ActionBar variant={variant} className={className}>
      {actionGroups.map((group, groupIndex) => (
        <ButtonGroup key={groupIndex} variant={variant}>
          {group.map((action) => {
            const {
              icon: IconComponent,
              label,
              disabled,
              id,
              variant: actionVariant,
            } = action;

            if (!IconComponent && !label) return null;

            return (
              <Button
                key={id}
                variant={buttonVariant}
                size="sm"
                onClick={() => executeAction(action)}
                disabled={disabled}
                aria-label={label || `Action ${id}`}
                className={
                  actionVariant === "destructive"
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
    </ActionBar>
  );
};
