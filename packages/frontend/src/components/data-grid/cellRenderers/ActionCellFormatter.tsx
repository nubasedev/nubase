import { MoreHorizontalIcon } from "lucide-react";
import { executeAction } from "../../../actions/executeAction";
import type { ActionOrSeparator } from "../../../actions/types";
import { useResourceContext } from "../../../context/ResourceContext";
import { Button } from "../../buttons/Button/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../dropdown-menu/DropdownMenu";
import type { RenderCellProps, RenderGroupCellProps } from "../types";

interface ActionCellFormatterProps<R> {
  actions: ActionOrSeparator[];
  row?: R;
  context?: any;
}

export function ActionCellFormatter<R>({
  row,
  actions,
  context,
  idField = "id",
}: ActionCellFormatterProps<R> & { idField?: string }) {
  const resourceContext = useResourceContext();

  // Don't show actions if there's no row data or no actions
  if (!row || !actions || actions.length === 0) {
    return null;
  }

  const handleActionClick = async (action: ActionOrSeparator) => {
    if (action === "separator") return;

    try {
      if (action.type === "handler") {
        // For handler actions, pass both rowData and context
        await action.onExecute({
          rowData: row,
          context: context,
        });
      } else if (action.type === "resource") {
        // For resource actions on single rows, create a temporary context with just this row
        if (!resourceContext) {
          console.error("Resource action executed outside ResourceContext");
          return;
        }

        const rowId = (row as any)[idField];
        if (!rowId) {
          console.error(`Row missing ID field "${idField}"`);
          return;
        }

        // Create single-item resource context for this row action
        const singleRowResourceContext = {
          resourceType: resourceContext.resourceType,
          selectedIds: new Set([rowId]) as ReadonlySet<string | number>,
        };

        await executeAction(action, context, singleRowResourceContext);
      } else {
        // For command actions
        await executeAction(action, context);
      }
    } catch (error) {
      console.error("Error executing row action:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="h-8 w-8 p-0 !bg-transparent hover:!bg-transparent !shadow-none !text-muted-foreground hover:!text-foreground"
        >
          <span className="sr-only">Open actions menu</span>
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" className="w-48">
        {actions.map((action, index) => {
          if (action === "separator") {
            return <DropdownMenuSeparator key={`separator-${index}`} />;
          }

          return (
            <DropdownMenuItem
              key={action.id}
              variant={
                action.variant === "destructive" ? "destructive" : "default"
              }
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Wrapper for regular cell renderer
export function ActionCellRendererCell<R>(
  props: RenderCellProps<R> & {
    actions: ActionOrSeparator[];
    context?: any;
    idField?: string;
  },
) {
  return (
    <ActionCellFormatter
      row={props.row}
      actions={props.actions}
      context={props.context}
      idField={props.idField}
    />
  );
}

// Wrapper for group cell renderer
export function ActionCellRendererGroup<R>(
  _props: RenderGroupCellProps<R> & {
    actions: ActionOrSeparator[];
    context?: any;
  },
) {
  // For group cells, we don't show actions as they don't represent individual data items
  return null;
}
