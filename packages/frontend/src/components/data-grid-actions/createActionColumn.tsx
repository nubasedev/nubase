import type { ActionOrSeparator } from "../../actions/types";
import type { Column } from "../data-grid/types";
import {
  NuActionCellRendererCell,
  NuActionCellRendererGroup,
} from "./NuActionCellFormatter";

export const ACTION_COLUMN_KEY = "rdg-action-column";

/**
 * Creates an action column for a DataGrid that displays a dropdown menu with actions for each row.
 * @param actions - Array of actions or separators to display for each row
 * @param context - Optional context to pass to actions for HTTP calls and other operations
 * @param idField - Optional ID field name for resource actions (defaults to "id")
 * @returns Column configuration for the DataGrid
 */
export function createActionColumn<R>(
  actions: ActionOrSeparator[],
  context?: any,
  idField?: string,
): Column<R, any> {
  return {
    key: ACTION_COLUMN_KEY,
    name: "",
    width: 50,
    minWidth: 50,
    maxWidth: 50,
    resizable: false,
    sortable: false,
    frozen: true,
    renderHeaderCell: () => null,
    renderCell: (props) => (
      <NuActionCellRendererCell
        {...props}
        actions={actions}
        context={context}
        idField={idField}
      />
    ),
    renderGroupCell: (props) => (
      <NuActionCellRendererGroup
        {...props}
        actions={actions}
        context={context}
      />
    ),
  };
}
